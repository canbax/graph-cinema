import { textToMermaid } from "text-to-mermaid";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { AppSettingsService } from "./AppSettingsService";

export async function generateGraphFromSentence(
  sentence: string,
): Promise<OrderedExcalidrawElement[]> {
  try {
    const settings = AppSettingsService.getSettings();
    const options = {
      strategy: settings.parseStrategy,
      aiConfig: {
        apiKey: settings.aiApiKey || "",
        baseUrl: settings.aiBaseUrl || undefined,
      },
    };

    const layoutDirection = settings.layoutDirection || "TD";

    let text = await textToMermaid(sentence, options);
    if (!text) {
      throw new Error("No mermaid text generated");
    }

    // Apply layout direction override
    // Handle both 'graph' and 'flowchart' keywords
    // Replace existing direction (TD, TB, LR, RL) with user preference
    const targetDirection = layoutDirection;

    text = text.replace(
      /(graph|flowchart)\s+(TD|TB|LR|RL|BT)/,
      (_match, keyword) => `${keyword} ${targetDirection}`,
    );

    const excalidraw = await parseMermaidToExcalidraw(text);
    let elements = convertToExcalidrawElements(excalidraw.elements);

    // Normalize linear elements to ensure first point is at [0,0]
    elements = elements.map((el) => {
      if (
        (el.type === "arrow" || el.type === "line") &&
        el.points &&
        el.points.length > 0
      ) {
        const [p0x, p0y] = el.points[0];
        if (p0x !== 0 || p0y !== 0) {
          const newPoints = el.points.map(([x, y]) => [x - p0x, y - p0y]);
          return {
            ...el,
            x: el.x + p0x,
            y: el.y + p0y,
            points: newPoints,
          };
        }
      }
      return el;
    });

    return fixDiagramLayout(elements);
  } catch (error) {
    console.error("Error generating graph:", error);
    throw error;
  }
}

export function fixDiagramLayout(
  elements: OrderedExcalidrawElement[],
): OrderedExcalidrawElement[] {
  const PADDING = 20;
  const MIN_WIDTH = 60;
  const MIN_HEIGHT = 40;
  const TEXT_MIN_WIDTH = 10;

  // CLEANUP: Sanitize text (remove newlines, trim, fix split words)
  elements = elements.map((el) => {
    if (el.type === "text") {
      let text = el.text || "";
      text = text.replace(/[\n\r]+/g, "");
      text = text.trim();
      return { ...el, text };
    }
    return el;
  });

  // ---------------------------------------------------------
  // PRE-PROCESSING: Resize containers to fit text (Pass 0, 1, 2)
  // ---------------------------------------------------------

  // Map container IDs to text elements
  const containerTextMap = new Map<string, OrderedExcalidrawElement>();
  elements.forEach((el) => {
    if (el.type === "text" && el.containerId) {
      containerTextMap.set(el.containerId, el);
    }
  });

  // Store adjustments to apply to text elements
  const adjustments = new Map<string, { dx: number; dy: number }>();

  // Pass 0: Unwrap text if necessary
  const textAdjustedElements = elements.map((el) => {
    if (el.type === "text") {
      const elemText = el.text;
      if (elemText) {
        const newWidth = TEXT_MIN_WIDTH * elemText.length;
        if (el.width >= newWidth) return el;
        if (newWidth !== el.width) {
          const estimatedLines = Math.max(
            1,
            Math.ceil((elemText.length * 8) / newWidth),
          );
          const newHeight = estimatedLines * 20;
          return { ...el, width: newWidth, height: newHeight };
        }
      }
    }
    return el;
  });

  // Re-map container texts after potential updates
  containerTextMap.clear();
  textAdjustedElements.forEach((el) => {
    if (el.type === "text" && el.containerId) {
      containerTextMap.set(el.containerId, el);
    }
  });

  // Pass 1: Adjust containers and calculate needed shifts
  const elementsWithResizedContainers = textAdjustedElements.map((el) => {
    if (["ellipse", "diamond", "rectangle"].includes(el.type)) {
      const textEl = containerTextMap.get(el.id);
      if (textEl) {
        const widthScale = el.type === "ellipse" ? 1.6 : 1.3;
        const requiredWidth = textEl.width * widthScale + PADDING;
        const requiredHeight = textEl.height + PADDING * 2;

        const minWidth = Math.max(MIN_WIDTH, requiredWidth);
        const minHeight = Math.max(MIN_HEIGHT, requiredHeight);

        if (el.width < minWidth || el.height < minHeight) {
          const oldWidth = el.width;
          const oldHeight = el.height;
          const newWidth = Math.max(el.width, minWidth);
          const newHeight = Math.max(el.height, minHeight);

          const dx = (oldWidth - newWidth) / 2;
          const dy = (oldHeight - newHeight) / 2;

          adjustments.set(el.id, { dx, dy });

          return {
            ...el,
            width: newWidth,
            height: newHeight,
            x: el.x + dx,
            y: el.y + dy,
          };
        }
      }
    }
    return el;
  });

  // Pass 2: Adjust text positions based on their container's adjustment
  const currentElements = elementsWithResizedContainers.map((el) => {
    if (el.type === "text" && el.containerId) {
      const adj = adjustments.get(el.containerId);
      if (adj) {
        return {
          ...el,
          x: el.x + adj.dx,
          y: el.y + adj.dy,
        };
      }
    }
    return el;
  });

  // ---------------------------------------------------------
  // NEW ALGORITHM: Top-down vertical collision resolution
  // ---------------------------------------------------------

  // Helper: Find element with lowest Y (visual top)
  const findTopMostElement = (
    els: OrderedExcalidrawElement[],
  ): OrderedExcalidrawElement | null => {
    let topEl: OrderedExcalidrawElement | null = null;
    let minY = Infinity;

    els.forEach((el) => {
      // Filter out purely decorative or structural elements if needed,
      // but usually we want the top meaningful node.
      // Ignoring lines/arrows for "top-most" check is usually safer for layout.
      if (el.isDeleted) return;
      if (el.type === "arrow" || el.type === "line") return;

      // Also ignore text that is bound to a container, rely on the container itself
      if (el.type === "text" && el.containerId) return;

      if (el.y < minY) {
        minY = el.y;
        topEl = el;
      }
    });
    return topEl;
  };

  // Helper: Check for vertical collision
  // Returns negative value if collision (overlap amount), positive if safe distance.
  // e1 is the element we are checking (the top element usually)
  // e2 is the element we might collide with
  const checkVerticalCollision = (
    r1: { x: number; y: number; width: number; height: number },
    r2: { x: number; y: number; width: number; height: number },
  ): number => {
    // Horizontal overlap check first
    const horizontalOverlap = r1.x < r2.x + r2.width && r1.x + r1.width > r2.x;

    if (!horizontalOverlap) {
      return 1; // Arbitrary positive number, no collision possible horizontally
    }

    // Check vertical overlap
    // We assume r1 is "supposed" to be above r2 effectively, or we just check raw overlap.
    // User asked: "determine if there is a collision... negative value... collision"

    // Standard AABB overlap
    const isOverlapping = r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;

    if (isOverlapping) {
      // Calculate overlap amount.
      // Since we want to move r1 UP, we care about how much r1's bottom is below r2's top.
      // OR how much r1's top is below r2's bottom.

      // Let's assume we want to know how deep the penetration is.
      // Intersection height:
      const overlapBottom = Math.min(r1.y + r1.height, r2.y + r2.height);
      const overlapTop = Math.max(r1.y, r2.y);
      const overlapHeight = overlapBottom - overlapTop;

      return -overlapHeight;
    }

    // If no overlap, return distance
    // This logic can be refined if we specifically check "is r1 above r2?"
    return 1;
  };

  const topElement = findTopMostElement(currentElements);

  if (topElement) {
    let maxOverlap = 0;

    // Check collision against all other relevant elements
    currentElements.forEach((otherEl) => {
      if (otherEl.id === topElement.id) return;

      // Ignore specialized elements for collision
      if (otherEl.isDeleted) return;

      // Check bound elements specifically as requested
      // "Check if top most element vertically collides with any of it's boundElements"
      // Excalidraw elements have `boundElements` property which is an array of {id, type}

      // If it is bound, user wanted to check collision.
      // If it is NOT bound, we also usually want to check collision to avoid overlapping unrelated nodes.
      // The user prompt said: "Check if top most element vertically collides with any of it's `boundElements` and if there is a collision, move... up"
      // It implied doing it FOR bound elements, but implicitly we should do it for others too if they overlap?
      // "Write another function... to check if there is a vertical collisions... if neg... move top most element"
      // Then purely "Also check if... boundElements...".

      // I will apply collision check to ALL non-ignored elements, which covers bound elements too.

      const collisionVal = checkVerticalCollision(
        {
          x: topElement.x,
          y: topElement.y,
          width: topElement.width,
          height: topElement.height,
        },
        {
          x: otherEl.x,
          y: otherEl.y,
          width: otherEl.width,
          height: otherEl.height,
        },
      );

      if (collisionVal < 0) {
        // Keep track of the worst collision (most negative)
        // We want the magnitude, so abs(collisionVal) is the push amount
        if (Math.abs(collisionVal) > maxOverlap) {
          maxOverlap = Math.abs(collisionVal);
        }
      }
    });

    if (maxOverlap > 0) {
      // Move top element up
      const shiftAmount = maxOverlap;

      // Apply shift to topElement
      // AND if topElement is a container, we must move its text too

      adjustments.set(topElement.id, { dx: 0, dy: -shiftAmount });

      return currentElements.map((el) => {
        if (el.id === topElement.id) {
          return { ...el, y: el.y - shiftAmount };
        }
        // If this is the text inside the top element
        if (el.type === "text" && el.containerId === topElement.id) {
          return { ...el, y: el.y - shiftAmount };
        }
        return el;
      });
    }
  }

  return currentElements;
}
