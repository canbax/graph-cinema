import { useState, useRef, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { generateGraphFromSentence } from "../services/text2excalidraw";
import "./Whiteboard.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface WhiteboardProps {
  currentSentence?: string;
  settingsVersion?: number;
}

export default function Whiteboard({ currentSentence, settingsVersion }: WhiteboardProps) {
  const [height, setHeight] = useState(500);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const isDraggingRef = useRef<'top' | 'bottom' | null>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (!currentSentence || !excalidrawAPI) return;

    const generate = async () => {
      try {
        const graphData = await generateGraphFromSentence(currentSentence);
        if (graphData) {
          excalidrawAPI.updateScene({ elements: graphData });
          excalidrawAPI.scrollToContent(graphData, { fitToContent: true });
        }
      } catch (error) {
        console.error("Failed to generate graph", error);
      }
    };

    generate();

  }, [currentSentence, excalidrawAPI, settingsVersion]);


  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = 'bottom';
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.body.style.cursor = 'ns-resize';
    e.preventDefault();

    const onMouseMove = (me: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = me.clientY - startYRef.current;
      if (isDraggingRef.current === 'bottom') {
        setHeight(Math.max(200, startHeightRef.current + delta));
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = null;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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
