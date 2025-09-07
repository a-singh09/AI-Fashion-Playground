import { GoogleGenAI, GenerateContentResponse, Modality, Part, Type } from "@google/genai";
import type { ImageFile, ClothingMetadata, WardrobeItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToPart = (file: ImageFile): Part => {
    const match = file.src.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!match) {
        throw new Error(`Invalid image data format for ${file.name}.`);
    }
    const mimeType = match[1];
    const data = match[2];
    
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
};

const getBasePrompt = (mood: string, steering: string) => `
Create a new image by combining the elements from the provided images. Your task is a virtual try-on.

1.  Take the person from the first image.
2.  Dress them in the clothing items from the subsequent images.
3.  **Crucially, do not alter the person's face, hair, or body shape. They must remain identical to the first image.**

The final image should be a hyper-realistic, high-resolution photograph of the person wearing the new outfit.
Place them in this scene: **${mood}**.
The lighting on the person should match the scene.
${steering ? `Additional style direction: "${steering}".` : ''}
`;


// FIX: Correctly process API response by iterating through candidates[0].content.parts.
const processApiResponse = (response: GenerateContentResponse): { images: string[]; error?: string } => {
    if (!response.candidates || response.candidates.length === 0) {
        return { images: [], error: "AI did not return a valid response. The request may have been blocked." };
    }

    const parts = response.candidates[0].content?.parts ?? [];
    const generatedImages = parts.map((part: Part) => {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        return null;
    }).filter((img: string | null): img is string => img !== null);

    if (generatedImages.length === 0) {
        const textPart = parts.find((part: any) => part.text);
        const refusalReason = textPart?.text || 'No reason provided.';
        return { images: [], error: `AI did not return an image. It might have refused the request. Reason: ${refusalReason}` };
    }
    
    return { images: generatedImages };
};


export const generateStyledImage = async (
    avatar: ImageFile,
    clothingItems: ImageFile[],
    mood: string,
    styleSteering: string
): Promise<{ images: string[]; error?: string }> => {
    try {
        const model = 'gemini-2.5-flash-image-preview';

        const avatarPart = fileToPart(avatar);
        const clothingParts = clothingItems.map(fileToPart);
        const textPromptPart = { text: getBasePrompt(mood, styleSteering) };
        
        const contents = {
            parts: [avatarPart, ...clothingParts, textPromptPart],
        };
        
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        return processApiResponse(response);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { images: [], error: `Failed to generate image. Please check your API key and network connection. Details: ${errorMessage}` };
    }
};

export const refineImage = async (
    baseImage: ImageFile,
    steeringPrompt: string
): Promise<{ images: string[]; error?: string }> => {
    try {
        const model = 'gemini-2.5-flash-image-preview';

        const baseImagePart = fileToPart(baseImage);
        const textPromptPart = { text: `Apply this refinement to the image: "${steeringPrompt}". It is essential to maintain the identity and body shape of the person in the photo.` };

        const contents = {
            parts: [baseImagePart, textPromptPart]
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        return processApiResponse(response);
    } catch (error) {
        console.error("Error refining image with Gemini API:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { images: [], error: `Failed to refine image. Details: ${errorMessage}` };
    }
};

export const selectOutfitFromWardrobe = async (
    event: string,
    wardrobe: WardrobeItem[],
    styleNotes: string,
    preferredItemNames: string[]
): Promise<{ selection: string[], reasoning: string, affirmation: string, error?: string }> => {
    try {
        const model = 'gemini-2.5-flash';
        const clothingList = wardrobe.map(item => `"${item.name}"`).join(', ');

        const preferredItemsPrompt = preferredItemNames.length > 0
            ? `\n**User's Must-Haves:**\nThe user would love to include these items if possible: [${preferredItemNames.join(', ')}]. Prioritize these in your selection if they fit the event and style notes.`
            : '';


        const prompt = `You are a fun, encouraging, and stylish best friend helping a user get ready. Your tone is conversational, supportive, and educational.

        **Here's what's in our closet:**
        [${clothingList}]

        **The event we're getting ready for:**
        "${event}"
        
        ${styleNotes ? `**Here are some style notes they mentioned:**\n"${styleNotes}"\n` : ''}${preferredItemsPrompt}

        **Your Task:**
        1.  Look through the closet and pick the perfect, complete outfit (e.g., top, bottom, shoes) for the event.
        2.  You MUST respect their style notes and STRONGLY consider their must-have items if provided.
        3.  Don't pick more than 4 items.
        4.  Explain WHY this is the perfect look. Be specific about fashion concepts (e.g., color theory, silhouette, texture contrast). Talk to the user like a friend. For example, "Okay, for the concert, we HAVE to go with the leather jacket to give you that cool, edgy vibe..." If they gave notes or must-haves, mention how you incorporated them!
        5. Provide a short, sweet, and positive affirmation about the final look.

        Return your answer ONLY as a valid JSON object matching the provided schema. The 'selection' array must contain the exact names of the clothing items from the list provided. The 'reasoning' should be your friendly, conversational explanation. The 'affirmation' should be a single, confidence-boosting sentence.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        selection: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of strings containing the exact names of the chosen clothing items.",
                        },
                        reasoning: {
                            type: Type.STRING,
                            description: "Your friendly, encouraging, and educational explanation for why this outfit is perfect for the event."
                        },
                        affirmation: {
                            type: Type.STRING,
                            description: "A short, confidence-boosting affirmation about the look."
                        }
                    },
                    required: ["selection", "reasoning", "affirmation"]
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return { selection: result.selection, reasoning: result.reasoning, affirmation: result.affirmation };

    } catch (error) {
        console.error("Error calling Gemini API for outfit selection:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { selection: [], reasoning: '', affirmation: '', error: `AI failed to select an outfit. Details: ${errorMessage}` };
    }
};

export const analyzeClothingItem = async (item: ImageFile): Promise<ClothingMetadata> => {
     try {
        const model = 'gemini-2.5-flash';
        const imagePart = fileToPart(item);
        
        const prompt = `Analyze the clothing item in the image. Identify its category, primary color (be specific, e.g., 'Navy Blue', 'Off-White'), the most suitable season, and its general style. Respond with 'Unknown' if a field cannot be determined.

        -   **category**: Choose one: 'Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory', 'Dress', 'Unknown'.
        -   **season**: Choose one: 'Winter', 'Spring', 'Summer', 'Autumn', 'All-Season'.
        -   **style**: Choose one: 'Casual', 'Formal', 'Sporty', 'Business', 'Evening', 'Unknown'.
        
        Return a valid JSON object matching the schema.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, {text: prompt}] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, enum: ['Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory', 'Dress', 'Unknown'] },
                        color: { type: Type.STRING },
                        season: { type: Type.STRING, enum: ['Winter', 'Spring', 'Summer', 'Autumn', 'All-Season'] },
                        style: { type: Type.STRING, enum: ['Casual', 'Formal', 'Sporty', 'Business', 'Evening', 'Unknown'] }
                    },
                    required: ["category", "color", "season", "style"]
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ClothingMetadata;
    } catch (error) {
        console.error(`Error analyzing clothing item ${item.name}:`, error);
        // Return a default object on failure so the app doesn't crash
        return {
            category: 'Unknown',
            color: 'Unknown',
            season: 'All-Season',
            style: 'Unknown'
        };
    }
};