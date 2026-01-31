
import { textToMermaid } from "text-to-mermaid";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";


export async function generateGraphFromSentence(sentence: string, apiKey: string): Promise<OrderedExcalidrawElement[]> {

    try {
        const text = await textToMermaid(sentence, { useAI: false });
        console.log(text);
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
