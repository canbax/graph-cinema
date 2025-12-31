import { Excalidraw } from "@excalidraw/excalidraw";

export default function Whiteboard() {
  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <h1 style={{ textAlign: "center", padding: "10px", margin: 0, backgroundColor: "#f0f0f0" }}>Mock Whiteboard</h1>
      <div style={{ flex: 1 }}>
        <Excalidraw />
      </div>
    </div>
  );
}
