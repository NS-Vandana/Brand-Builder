import { GoogleGenAI, Modality, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getGeminiClient = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface GenerationResult {
  medium: string;
  imageUrl: string;
}

export async function generateProductVisuals(
  description: string,
  mediums: string[]
): Promise<GenerationResult[]> {
  const ai = getGeminiClient();
  
  // 1. Refine the prompt for consistency and "no people"
  const systemInstruction = `You are a world-class brand photographer and art director. 
  Your goal is to visualize a product based on a user's description.
  CRITICAL RULES:
  - NEVER include people or human figures in any image.
  - Maintain strict visual consistency of the product (colors, shape, branding) across all images.
  - The product should be the hero of every shot.
  - Use professional lighting and high-end aesthetics.`;

  const results: GenerationResult[] = [];

  // 2. Generate the "Master" product image first to establish consistency
  // We'll use this image as context for others if possible, or just use a very detailed text description.
  // For simplicity and reliability in this environment, we'll generate a detailed visual description first.
  
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a highly detailed visual description for a product based on this: "${description}". 
    Focus on specific materials, colors, textures, and unique design features. 
    Ensure the description is optimized for an image generation model. 
    Do not include any people in the description.`,
  });

  const detailedDescription = textResponse.text || description;

  // 3. Generate images for each medium
  // We'll process them sequentially to avoid hitting rate limits too hard, 
  // though parallel is possible if limits allow.
  
  for (const medium of mediums) {
    const mediumPrompt = `A professional ${medium} advertisement featuring the following product: ${detailedDescription}. 
    The product is shown in a ${medium} context. 
    High-end commercial photography, 8k resolution, cinematic lighting. 
    NO PEOPLE, NO HUMANS, NO HANDS. Just the product and the ${medium} environment.`;

    const imageConfig = {
      aspectRatio: medium === "Billboard" ? "16:9" : medium === "Social Post" ? "1:1" : "3:4",
    };

    // For the first image, we just use the text. 
    // For subsequent images, we could theoretically pass the first image back, 
    // but gemini-2.5-flash-image is best used with clear text descriptions for consistency.
    // However, the "Edit Images" section shows we can pass an image + text.
    
    const contents: any = {
      parts: [{ text: mediumPrompt }],
    };

    // If we have a "Master" image, we can try to use it as context.
    // Note: gemini-2.5-flash-image supports image input.
    if (results.length > 0) {
      const masterImage = results[0].imageUrl.split(',')[1];
      contents.parts.unshift({
        inlineData: {
          data: masterImage,
          mimeType: "image/png"
        }
      });
      contents.parts[1].text = `Based on the provided product image, create a ${medium} advertisement. ${mediumPrompt}`;
    }

    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: {
        imageConfig,
      },
    });

    let imageUrl = "";
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (imageUrl) {
      results.push({ medium, imageUrl });
    }
  }

  return results;
}
