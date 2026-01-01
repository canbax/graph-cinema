import { Excalidraw } from "@excalidraw/excalidraw";

export default function Whiteboard() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ height: "500px" }}>
        <Excalidraw />
      </div>
    </>
  );
}
