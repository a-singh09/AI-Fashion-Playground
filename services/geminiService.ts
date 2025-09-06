import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { ImageFile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToPart = (file: ImageFile): Part => {
    // A more robust way to parse the base64 string
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

const getBasePrompt = (mood: string, steering: string) => `Create a photorealistic, full-body image of the woman from the first photo, preserving her face, body proportions, skin tone, and hair. Dress her in the clothing items from the following uploaded images. Fit the clothes naturally to her body, respecting natural fabric drape, contours, and realistic shadows. Set the scene as ${mood}. Lighting and background should match the chosen mood. The final image should look like a professional fashion photo, with sharp focus on both the person and the clothing fit. Retain all facial details and natural posture—no warping or “sticker” effect. ${steering ? `Additionally, apply this user request: "${steering}".` : ''} Make only the requested changes while keeping all other elements the same.`;


export const generateStyledImage = async (
    avatar: ImageFile,
    clothingItems: ImageFile[],
    mood: string,
    styleSteering: string
): Promise<{ image: string | null; text: string | null; error?: string }> => {
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
        
        let generatedImage: string | null = null;
        let generatedText: string | null = null;

        if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
             return { image: null, text: null, error: "AI did not return a valid response. The request may have been blocked." };
        }

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if (part.text) {
                generatedText = part.text;
            }
        }

        if (!generatedImage) {
            return { image: null, text: generatedText, error: "AI did not return an image. It might have refused the request. " + (generatedText || '') };
        }

        return { image: generatedImage, text: generatedText };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { image: null, text: null, error: `Failed to generate image. Please check your API key and network connection. Details: ${errorMessage}` };
    }
};
