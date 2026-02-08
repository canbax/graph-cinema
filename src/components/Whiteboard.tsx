import { useState, useRef, useEffect } from "react";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { generateGraphFromSentence } from "../services/text2excalidraw";
import "./Whiteboard.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface WhiteboardProps {
  currentSentence?: string;
  settingsVersion?: number;
}

export default function Whiteboard({
  currentSentence,
  settingsVersion,
}: WhiteboardProps) {
  const [height, setHeight] = useState(500);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const isDraggingRef = useRef<"top" | "bottom" | null>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (!currentSentence || !excalidrawAPI) return;

    const generate = async () => {
      try {
        const fullElements = await generateGraphFromSentence(currentSentence);
        if (!fullElements || fullElements.length === 0) return;

        // 1. Set the view based on the full graph so it doesn't jump around
        excalidrawAPI.scrollToContent(fullElements, { fitToContent: true });

        // 2. Clear scene initially
        excalidrawAPI.updateScene({ elements: [] });

        // 3. Group elements for animation
        // We want to draw nodes first, then arrows

        const nodes: typeof fullElements = [];
        const arrows: typeof fullElements = [];

        // Helper to check if an element is an arrow/line
        const isArrow = (type: string) => type === "arrow" || type === "line";

        fullElements.forEach((el) => {
          if (isArrow(el.type)) {
            arrows.push(el);
          } else {
            // It's a node or text
            nodes.push(el);
          }
        });

        // 4. Animation Settings
        const TOTAL_DURATION_MS = 1000;

        // Combine into a sequence: Nodes first, then Arrows
        // We simply slice the full arrays over time
        // However, we want "groups" to appear together (container + text)
        // Since we didn't implement complex grouping map logic yet,
        // we can rely on the fact that text usually follows container in our generation,
        // or just accept that text might pop in 1 frame later (16ms difference is negligible).
        // A simple "percentage relative" approach works well enough for "liveliness".

        const allSorted = [...nodes, ...arrows];
        const totalElements = allSorted.length;

        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / TOTAL_DURATION_MS, 1);

          // Calculate how many elements to show based on progress
          // Ease out cubic for nicer feel: 1 - pow(1 - x, 3)
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const countToShow = Math.ceil(easeProgress * totalElements);

          const currentVisible = allSorted.slice(0, countToShow);

          excalidrawAPI.updateScene({ elements: currentVisible });

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
      } catch (error) {
        console.error("Failed to generate graph", error);
      }
    };

    generate();
  }, [currentSentence, excalidrawAPI, settingsVersion]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = "bottom";
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.body.style.cursor = "ns-resize";
    e.preventDefault();

    const onMouseMove = (me: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = me.clientY - startYRef.current;
      if (isDraggingRef.current === "bottom") {
        setHeight(Math.max(200, startHeightRef.current + delta));
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = null;
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="whiteboard-container" style={{ height: `${height}px` }}>
      <div className="whiteboard-content">
        <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)}>
          <MainMenu>
            <MainMenu.Item onSelect={() => window.alert("Item1")}>
              Item1
            </MainMenu.Item>
            <MainMenu.Separator />
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveToActiveFile />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.CommandPalette />
            <MainMenu.DefaultItems.SearchMenu />
            <MainMenu.DefaultItems.Help />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.Separator />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
        </Excalidraw>
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
