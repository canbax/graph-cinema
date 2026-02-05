
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

        const text = await textToMermaid(sentence, options);
        if (!text) {
            throw new Error("No mermaid text generated");
        }

        const excalidraw = await parseMermaidToExcalidraw(text);

        const elements = convertToExcalidrawElements(excalidraw.elements);
        return fixDiagramLayout(elements);
    } catch (error) {
        console.error("Error generating graph:", error);
        throw error;
    }
}

export function fixDiagramLayout(elements: OrderedExcalidrawElement[]): OrderedExcalidrawElement[] {
    const PADDING = 20;
    const MIN_WIDTH = 60;
    const MIN_HEIGHT = 40;
    const TEXT_MIN_WIDTH = 40;

    // Map container IDs to text elements
    const containerTextMap = new Map<string, OrderedExcalidrawElement>();
    elements.forEach(el => {
        if (el.type === "text" && el.containerId) {
            containerTextMap.set(el.containerId, el);
        }
    });

    // Store adjustments to apply to text elements
    const adjustments = new Map<string, { dx: number, dy: number }>();

    // Pass 0: Unwrap text if necessary
    // If text is very narrow but has short content, force it wider to prevent wrapping
    const textAdjustedElements = elements.map(el => {
        if (el.type === "text" && (el as any).text && el.width < TEXT_MIN_WIDTH) {
            // Check if text likely wraps efficiently. 
            // For simple heuristics: if text length is small but width is tiny, force expand.
            // Excalidraw effectively re-calculates dimensions if we don't provide them, 
            // but here we have fixed dimensions from mermaid-to-excalidraw.
            // We can't easily recalculate exact width without font metrics.
            // BUT, we can just increase the width.
            const newWidth = Math.max(el.width, TEXT_MIN_WIDTH);
            if (newWidth !== el.width) {
                // If we widen the text, we should probably reduce height, assuming it unwraps.
                // This is an approximation. 
                const estimatedLines = Math.max(1, Math.ceil(((el as any).text.length * 8) / newWidth));
                const newHeight = estimatedLines * 20; // Approx 20px per line
                return { ...el, width: newWidth, height: newHeight };
            }
        }
        return el;
    });

    // Re-map container texts after potential updates
    containerTextMap.clear();
    textAdjustedElements.forEach(el => {
        if (el.type === "text" && el.containerId) {
            containerTextMap.set(el.containerId, el);
        }
    });


    // Pass 1: Adjust containers and calculate needed shifts
    let elementsWithResizedContainers = textAdjustedElements.map(el => {
        if (["ellipse", "diamond", "rectangle"].includes(el.type)) {
            const textEl = containerTextMap.get(el.id);
            if (textEl) {
                // Ellipses need more width to fit text in the center visually
                const widthScale = el.type === "ellipse" ? 1.6 : 1.3;

                // Calculate required dimensions
                const requiredWidth = textEl.width * widthScale + PADDING;
                const requiredHeight = textEl.height + PADDING * 2;

                const minWidth = Math.max(MIN_WIDTH, requiredWidth);
                const minHeight = Math.max(MIN_HEIGHT, requiredHeight);

                if (el.width < minWidth || el.height < minHeight) {
                    const oldWidth = el.width;
                    const oldHeight = el.height;

                    const newWidth = Math.max(el.width, minWidth);
                    const newHeight = Math.max(el.height, minHeight);

                    // Calculate shift to keep centered relative to original position
                    const dx = (oldWidth - newWidth) / 2;
                    const dy = (oldHeight - newHeight) / 2;

                    adjustments.set(el.id, { dx, dy });

                    // Return new object with updated properties
                    return {
                        ...el,
                        width: newWidth,
                        height: newHeight,
                        x: el.x + dx,
                        y: el.y + dy
                    };
                }
            }
        }
        return el;
    });

    // Pass 2: Adjust text positions based on their container's adjustment
    let elementsWithAdjustedText = elementsWithResizedContainers.map(el => {
        if (el.type === "text" && el.containerId) {
            const adj = adjustments.get(el.containerId);
            if (adj) {
                return {
                    ...el,
                    x: el.x + adj.dx,
                    y: el.y + adj.dy
                };
            }
        }
        return el;
    });

    // Pass 3: Collision Avoidance (Vertical only for now, simple)
    // Sort by Y to handle top-down flow
    // We only move things DOWN to avoid overlapping previous elements.
    // Iterative approach: Check each element against all *previous* elements (that are higher).
    // If overlap, move current element down.

    // Filter mainly nodes and text that are meaningful
    const margin = 20;
    const sortedIndices = elementsWithAdjustedText
        .map((el, index) => ({ index, y: el.y }))
        .sort((a, b) => a.y - b.y)
        .map(item => item.index);

    const verticalShifts = new Map<string, number>(); // id -> shift

    // Helper to get shifted rect
    const getRect = (el: any, shiftY: number = 0) => {
        return {
            x: el.x,
            y: el.y + shiftY,
            w: el.width,
            h: el.height,
            id: el.id
        };
    };

    const isOverlapping = (r1: any, r2: any) => {
        return r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y;
    };

    for (let i = 0; i < sortedIndices.length; i++) {
        const currIdx = sortedIndices[i];
        const currEl = elementsWithAdjustedText[currIdx];
        if (currEl.isDeleted) continue;

        // Skip edges/arrows for collision (they are hard to box)
        if (currEl.type === "arrow" || currEl.type === "line") continue;

        let currentShift = verticalShifts.get(currEl.id) || 0;
        // Also inherit shift from container if text? No, text moves with container usually.
        // If text is inside container, we moved it together.
        // We generally treat container+text as one unit.
        // If we move container, we must move text.

        // Let's just resolve overlaps for Containers and "Free" Text.
        // Text inside container doesn't collide with its own container.

        if (currEl.type === "text" && currEl.containerId) continue; // Skip text inside container for collision check

        let rect1 = getRect(currEl, currentShift);

        // Check against valid previous elements
        for (let j = 0; j < i; j++) {
            const prevIdx = sortedIndices[j];
            const prevEl = elementsWithAdjustedText[prevIdx];
            if (prevEl.isDeleted) continue;
            if (prevEl.type === "arrow" || prevEl.type === "line") continue;
            if (prevEl.type === "text" && prevEl.containerId) continue;

            // Don't check text against its own container (already filtered by loop type check, but be safe)
            // Don't check text against its own container (already filtered by loop type check, but be safe)
            if ((currEl as any).containerId === prevEl.id) continue;
            if ((prevEl as any).containerId === currEl.id) continue;

            const prevShift = verticalShifts.get(prevEl.id) || 0;
            const rect2 = getRect(prevEl, prevShift);

            if (isOverlapping(rect1, rect2)) {
                // Overlap! Move currEl down.
                const requiredY = rect2.y + rect2.h + margin;
                const diff = requiredY - rect1.y;
                if (diff > 0) {
                    currentShift += diff;
                    rect1.y += diff; // Update current rect for next checks
                }
            }
        }
        verticalShifts.set(currEl.id, currentShift);
    }

    // Apply vertical shifts
    return elementsWithAdjustedText.map(el => {
        let shift = verticalShifts.get(el.id);

        // If this is text inside a container, use container's shift
        if (el.type === "text" && el.containerId) {
            shift = verticalShifts.get(el.containerId);
        }

        if (shift && shift > 0) {
            return {
                ...el,
                y: el.y + shift
            };
        }
        return el;
    });
}
