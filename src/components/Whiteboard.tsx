import { Excalidraw } from "@excalidraw/excalidraw";

export default function Whiteboard() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ height: "800px" }}>
        <Excalidraw />
      </div>
    </>
  );
}
