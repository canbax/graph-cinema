import { useState } from 'react';
import './TextImporter.css';

interface TextImporterProps {
    onProcess: () => void;
}

const TextImporter = ({ onProcess }: TextImporterProps) => {
    const [text, setText] = useState('');

    const handleProcess = () => {
        if (!text.trim()) return;
        localStorage.setItem('articleText', text);
        onProcess();
    };

    return (
        <div className="text-importer-container">
            <textarea
                className="article-input"
                placeholder="Paste your article here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button className="process-btn" onClick={handleProcess}>
                Process...
            </button>
        </div>
    );
};

export default TextImporter;
