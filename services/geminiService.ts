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