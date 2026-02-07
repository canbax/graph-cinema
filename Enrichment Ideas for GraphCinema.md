Enrichment Ideas for GraphCinema
Based on the analysis of your current codebase, here are several ideas to enrich the features of GraphCinema.

1. Icon & Emoji Support 🎨
   Currently, nodes are just text. We can automatically detect keywords and add relevant icons or emojis to the nodes.

Implementation: Create a keyword-to-emoji mapper.
Example:
"User logs in" -> Node: User 👤
"Database stores data" -> Node: Database 🗄️
"Cloud sync" -> Node: Cloud ☁️
Benefit: Makes diagrams visually richer and easier to understand at a glance. 2. Visual Themes 🌈
Introduce "Themes" to style the diagram instantly.

Proposed Themes:
Classic Sketch: (Current) Black stroke, white/transparent background.
Blueprint: Blue background, white lines.
Dark Mode: Dark grey background, neon/light text and lines.
Corporate: Professional colors (blues, greys), straight lines (low roughness).
Playful: High roughness, vibrant fill colors for nodes.
Implementation: Add a "Theme" selector in Settings. Apply styles (stroke color, background color, roughness, font) during the generation process. 3. Advanced Shape Mapping HB
Map specific concepts to specific shapes, beyond just Circles and Diamonds.

Logic:
"Action" / "Process" -> Rectangle
"Decision" / "If" -> Diamond
"Start" / "End" -> Ellipse/Circle
"Database" / "Storage" -> Cylinder (Simulated or mapped if supported)
"Input" / "Output" -> Parallelogram
Implementation: Analyze the sentence text or Mermaid node types and force specific Excalidraw shapes. 4. Layout & Direction Control ↔️
Allow users to choose the flow of the storyboard.

Options:
Left to Right (LR): Best for timelines and sequences.
Top to Down (TD): Best for hierarchies and decision trees.
Implementation: Pass this preference to the Mermaid generation step (e.g., graph LR vs graph TD). 5. Hand-Drawn Customization ✍️
Give users fine-grained control over the "sketchy" feel.

Controls:
Roughness: Clean (0) to Sketchy (2).
Stroke Width: Thin to Bold.
Font Family: Handwritten (Virgil) vs Normal (Helvetica) vs Monospace (Cascadia). 6. Smart Collapsible Containers 📦
If a sentence is complex (e.g., "The backend consists of API, Auth, and DB"), group them into a container.

Implementation: Detect "consists of" or "contains" relationships and create a Group or Rectangle container in Excalidraw surrounding the child nodes.
Recommended First Steps
I recommend starting with 1. Icon Support and 2. Visual Themes as they provide the most immediate visual "wow" factor with reasonable implementation effort.
