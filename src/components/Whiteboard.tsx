import { useState, useRef, useCallback, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
// import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types"; // Fixed: removed invalid import
import { generateGraphFromSentence } from "../services/gemini";
import "./Whiteboard.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface WhiteboardProps {
  currentSentence?: string;
}

export default function Whiteboard({ currentSentence }: WhiteboardProps) {
  const [height, setHeight] = useState(500);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const isDraggingRef = useRef<'top' | 'bottom' | null>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const apiKeyRef = useRef(import.meta.env.VITE_GEMINI_API_KEY || '');

  useEffect(() => {
    if (!currentSentence || !excalidrawAPI) return;

    if (!apiKeyRef.current) {
      const key = prompt("Please enter your Gemini API Key:");
      if (key) {
        apiKeyRef.current = key;
      } else {
        console.warn("No API Key provided, skipping graph generation.");
        return;
      }
    }

    const generate = async () => {
      try {
        const graphData = await generateGraphFromSentence(currentSentence, apiKeyRef.current);
        if (graphData) {
          excalidrawAPI.updateScene({ elements: graphData });
          excalidrawAPI.scrollToContent(graphData, { fitToContent: true });
        }
      } catch (error) {
        console.error("Failed to generate graph", error);
      }
    };

    generate();

  }, [currentSentence, excalidrawAPI]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const delta = e.clientY - startYRef.current;

    // For top handle: Dragging UP (-delta) should INCREASE height?
    // Dragging DOWN (+delta) should DECREASE height?
    // Current logic: newHeight = startHeight - delta
    // If delta is -50 (up), height += 50. Correct direction for size.
    // For bottom handle: Dragging DOWN (+delta) should INCREASE height.
    // newHeight = startHeight + delta

    if (isDraggingRef.current === 'bottom') {
      setHeight(Math.max(200, startHeightRef.current + delta));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = null;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = 'bottom';
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.body.style.cursor = 'ns-resize';
    e.preventDefault();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="whiteboard-container" style={{ height: `${height}px` }}>

      <div className="whiteboard-content">
        <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
      </div>

      <div
        className="resize-handle bottom"
        onMouseDown={(e) => handleMouseDown(e)}
        title="Drag to resize"
      >
        <div className="handle-bar" />
      </div>
    </div>
  );
}
