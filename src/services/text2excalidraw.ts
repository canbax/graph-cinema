
import { textToMermaid } from "text-to-mermaid";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";


import { AppSettingsService } from "./AppSettingsService";

export async function generateGraphFromSentence(sentence: string): Promise<OrderedExcalidrawElement[]> {

    try {
        const settings = AppSettingsService.getSettings();
        const options = {
            strategy: settings.parseStrategy,
            aiConfig: {
                apiKey: settings.aiApiKey || '',
                baseUrl: settings.aiBaseUrl || undefined
            }
        };

        const longText = `Welcome to the era of Gemini 3.
Google DeepMind is thrilled to invite you to the Gemini 3 global hackathon. We are pushing the boundaries of what AI can do by enhancing reasoning capabilities, unlocking multimodal experiences and reducing latency. Now, we want to see what you can create with our most capable and intelligent model family to date.

Whether you are a seasoned AI engineer or writing your first line of code, this is your invitation to build the future. We are looking for more than just another chat interface. We want to see fun, creative, next-generation applications built with the Gemini 3 family

Why participate?
Be First: Get hands-on access to the Gemini 3 API before the rest of the world catches up.

Build Something New: This challenge is strictly for new applications. It’s a level playing field for everyone.

Win Big: We have a prize pool of $100,000 + interviews with the AI Futures Fund team for an opportunity to fund your project.`
        const text = await textToMermaid(longText, options);
        if (!text) {
            throw new Error("No mermaid text generated");
        }

        const excalidraw = await parseMermaidToExcalidraw(text);

        return convertToExcalidrawElements(excalidraw.elements);
    } catch (error) {
        console.error("Error generating graph:", error);
        throw error;
    }
}
