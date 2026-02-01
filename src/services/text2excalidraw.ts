
import { textToMermaid } from "text-to-mermaid";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";


import { AppSettingsService } from "./AppSettingsService";

export async function generateGraphFromSentence(sentence: string): Promise<OrderedExcalidrawElement[]> {

    try {
        const settings = AppSettingsService.getSettings();
        const options = {
            useAI: settings.useAI,
            aiConfig: settings.useAI ? {
                apiKey: settings.aiApiKey || '',
                baseUrl: settings.aiBaseUrl || undefined
            } : undefined
        };

        console.log(options);
        const text = await textToMermaid(sentence, options);
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
