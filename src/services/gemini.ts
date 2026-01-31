
import { textToMermaid } from "text-to-mermaid";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";


export async function generateGraphFromSentence(sentence: string, apiKey: string): Promise<any> {

    try {
        const text = await textToMermaid(sentence, { useAI: false });
        console.log(text);
        if (!text) {
            throw new Error("No mermaid text generated");
        }
        const excalidraw = await parseMermaidToExcalidraw(text);
        return excalidraw;
    } catch (error) {
        console.error("Error generating graph:", error);
        throw error;
    }
}
