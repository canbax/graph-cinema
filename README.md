# GraphCinema

GraphCinema is a tool that transforms natural language text into whiteboard diagrams. It serves as a bridge between storytelling and diagramming, allowing users to visualize narratives sentence-by-sentence or as a whole. It's main principle is "What You See Is What You Code"

## 🚀 Features

- **Text-to-Graph Conversion**: Instantly converts text descriptions into Mermaid.js graphs and renders them as hand-drawn Excalidraw diagrams.
- **Dual Modes**:
  - **Cinema Mode**: Plays back the text sentence-by-sentence, dynamically updating the whiteboard to match the narrative flow.
  - **Whole Text Mode**: Converts and visualizes the entire text at once for a complete overview.
- **Multiple Parsing Methods**:
  - **Deterministic**: Fast, basic, rule-based parsing (Default).
  - **Gemini AI**: Leverages Google's Gemini API for advanced understanding and complex relationships.
  - **Local LLM**: Connect to your own local LLM (like Ollama) for privacy and customization.
- **Interactive Workspace**:
  - **Cinema Canvas**: A fully interactive Excalidraw canvas to view and edit your diagrams.
  - **Timeline Controller**: Play, pause, scrub, and navigate through your narrative like a video.
  - **Script Sidebar**: Easy text input and settings management.
- **Customizable Layouts**: Support for multiple graph directions:
  - Top Down (TD)
  - Bottom Up (BT)
  - Left to Right (LR)
  - Right to Left (RL)

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Diagramming**: [Excalidraw](https://excalidraw.com/) & [Mermaid.js](https://mermaid.js.org/)
- **AI Integration**: [Google Gemini](https://deepmind.google/technologies/gemini/) & Custom LLM support
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/graph-cinema.git
   cd graph-cinema
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

Open the **Settings** dialog in the application to configure:

- **Parsing Strategy**: Choose between Deterministic, Gemini AI, or Local LLM.
- **API Keys**: Enter your Gemini API key if using the Gemini strategy.
- **LLM URL**: Set your local LLM endpoint (e.g., `http://localhost:11434/v1`) if using the Local LLM strategy.
- **Layout Direction**: Preferred direction for graph generation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)
