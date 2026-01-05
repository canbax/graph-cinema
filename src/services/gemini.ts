
import { GoogleGenAI } from '@google/genai';

const PROMPT_TEMPLATE = `
You are an expert at creating Excalidraw graphs.
Convert the following sentence into an Excalidraw JSON structure that represents a graph.
The graph should be a visual representation of the subject, verb, and object (or similar structure).
Nodes should be ellipses with text inside. Edges should be arrows connecting the nodes with labels if applicable.

Sentence: "{sentence}"

Output ONLY the raw JSON compatible with Excalidraw. Do not include markdown formatting or code blocks.
The JSON must follow this structure (this is just an example of format, not content):
{
  "type": "excalidraw",
  "version": 2,
  "source": "http://localhost:5173",
  "elements": [
      // ... elements here ...
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "currentItemFontFamily": 1
  }
}

Ensure the "elements" array contains the nodes and arrows correctly positioned.
Space them out so they don't overlap.
Position them generally left-to-right or top-to-down.
`;

export async function generateGraphFromSentence(sentence: string, apiKey: string): Promise<any> {
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }

    const genAI = new GoogleGenAI({ apiKey });

    const contents = PROMPT_TEMPLATE.replace("{sentence}", sentence);

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
        });
        const text = result.text;

        if (!text) {
            throw new Error("Gemini returned no text.");
        }

        // Clean up if the model returns markdown code blocks
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating graph:", error);
        throw error;
    }
}
