import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import type { ImageFile } from '../types';

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
**Primary Goal: Create a hyper-realistic, ultra-detailed, 8k resolution photograph.**

**Subject & Identity Preservation:**
- The subject is the woman in the first uploaded image.
- **It is absolutely critical to retain the exact facial identity of this woman.** Do not alter her facial structure, eye shape and color, nose, lips, or unique features. Preserve her skin tone and hair style and color precisely.
- Maintain her exact body proportions and pose.

**Clothing & Integration:**
- Dress the subject in the clothing items provided in the subsequent images.
- The clothes must be integrated realistically. They should conform to her body with natural folds, wrinkles, and shadows based on the fabric's properties and her pose. Avoid a flat, "pasted-on" or "sticker" appearance.

**Scene & Atmosphere:**
- Place the subject in the following scene: **${mood}**.
- The lighting of the scene (e.g., soft shadows, direct sunlight, ambient light) must be consistent and realistically affect both the subject and her clothing. The background should be coherent with the mood.

**Final Image Quality:**
- The final output must be a professional-grade fashion photograph, as if captured with a DSLR camera.
- Ensure sharp focus on the subject, especially her face and the clothing details.
- Avoid any hint of digital painting, smoothing, or an 'airbrushed' look. The result should be indistinguishable from a real photograph.

**User Adjustments (Apply carefully while respecting all rules above):**
${steering ? `- User request: "${steering}". Integrate this request naturally without compromising realism or identity preservation.` : ''}
`;

const processApiResponse = (response: any): { images: string[]; error?: string } => {
    if (!response.candidates || response.candidates.length === 0) {
        return { images: [], error: "AI did not return a valid response. The request may have been blocked." };
    }

    const generatedImages = response.candidates.map((candidate: any) => {
        const imagePart = candidate.content?.parts?.find((part: any) => part.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        return null;
    }).filter((img: string | null): img is string => img !== null);

    if (generatedImages.length === 0) {
        const textPart = response.candidates[0].content?.parts?.find((part: any) => part.text);
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
        const textPromptPart = { text: `Based on the provided image, apply this change: "${steeringPrompt}". Maintain the original style, realism, and subject identity.` };

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
    mood: string,
    wardrobe: ImageFile[]
): Promise<{ selection: string[], reasoning: string, error?: string }> => {
    try {
        const model = 'gemini-2.5-flash';
        const clothingList = wardrobe.map(item => `"${item.name}"`).join(', ');

        const prompt = `You are a professional fashion stylist. A user needs help picking an outfit from their wardrobe for a specific occasion.

        **User's Wardrobe:**
        [${clothingList}]

        **Occasion/Mood:**
        "${mood}"

        **Your Task:**
        1.  Analyze the user's wardrobe and the occasion.
        2.  Select a complete and appropriate outfit (e.g., a top, a bottom, shoes). Do not select more than 4 items.
        3.  Provide a brief, encouraging reason for your selection.

        Return your answer ONLY as a valid JSON object matching the provided schema. The 'selection' array must contain the exact names of the clothing items from the list provided.`;
        
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
                            description: "A brief, friendly explanation for why this outfit was chosen for the occasion."
                        }
                    },
                    required: ["selection", "reasoning"]
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return { selection: result.selection, reasoning: result.reasoning };

    } catch (error) {
        console.error("Error calling Gemini API for outfit selection:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { selection: [], reasoning: '', error: `AI failed to select an outfit. Details: ${errorMessage}` };
    }
};