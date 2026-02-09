import { useState, useRef, useEffect } from "react";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { generateGraphFromSentence } from "../services/text2excalidraw";
import { emojifySentence } from "../utils/emojiMapper";
import "./Whiteboard.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

interface WhiteboardProps {
  currentSentence?: string;
  settingsVersion?: number;
  currentIndex: number;
  onSceneUpdate: (index: number, elements: ExcalidrawElement[]) => void;
  getSceneElements: (index: number) => ExcalidrawElement[];
}

export default function Whiteboard({
  currentSentence,
  settingsVersion,
  currentIndex,
  onSceneUpdate,
  getSceneElements,
}: WhiteboardProps) {
  const [height, setHeight] = useState(1000);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const isDraggingRef = useRef<"top" | "bottom" | null>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Debounce ref to avoid too many updates
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentSentence || !excalidrawAPI) return;

    const generateOrLoad = async () => {
      try {
        // 1. Check if we have cached elements for this scene
        const cachedElements = getSceneElements(currentIndex);

        if (cachedElements && cachedElements.length > 0) {
          // Restore from cache
          excalidrawAPI.updateScene({ elements: cachedElements });
          // Ideally invoke scrollToContent if you want to reset view, or store view state too
          // For now, let's fit to content to ensure visibility
          excalidrawAPI.scrollToContent(cachedElements, { fitToContent: true });
          return;
        }

        // 2. No cache, generate new
        const fullElements = await generateGraphFromSentence(currentSentence);
        if (!fullElements || fullElements.length === 0) return;

        // Save initial state to cache
        onSceneUpdate(currentIndex, fullElements);

        // 3. Set the view based on the full graph
        excalidrawAPI.scrollToContent(fullElements, { fitToContent: true });

        // 4. Animation Logic
        excalidrawAPI.updateScene({ elements: [] });

        const nodes: typeof fullElements = [];
        const arrows: typeof fullElements = [];
        const isArrow = (type: string) => type === "arrow" || type === "line";

        fullElements.forEach((el) => {
          if (isArrow(el.type)) {
            arrows.push(el);
          } else {
            nodes.push(el);
          }
        });

        const TOTAL_DURATION_MS = 1000;
        const allSorted = [...nodes, ...arrows];
        const totalElements = allSorted.length;

        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / TOTAL_DURATION_MS, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const countToShow = Math.ceil(easeProgress * totalElements);
          const currentVisible = allSorted.slice(0, countToShow);

          excalidrawAPI.updateScene({ elements: currentVisible });

          // Update cache with currently visible elements if animation finishes
          if (progress === 1) {
            onSceneUpdate(currentIndex, fullElements);
          }

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

    generateOrLoad();
  }, [
    currentSentence,
    excalidrawAPI,
    settingsVersion,
    currentIndex,
    getSceneElements,
    onSceneUpdate,
  ]);

  const handleChange = (elements: readonly ExcalidrawElement[]) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      onSceneUpdate(currentIndex, [...elements]);
    }, 500);
  };

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

  const handleEmojify = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const updatedElements = elements.map((el) => {
      if (el.type === "text") {
        const newText = emojifySentence(el.text);
        if (newText !== el.text) {
          return {
            ...el,
            text: newText,
            originalText: newText,
          };
        }
      }
      return el;
    });

    excalidrawAPI.updateScene({ elements: updatedElements });
  };

  return (
    <div className="whiteboard-container" style={{ height: `${height}px` }}>
      <div className="whiteboard-content">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
        >
          <MainMenu>
            <MainMenu.Item onSelect={handleEmojify}>Emojify</MainMenu.Item>
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
