import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import SettingsDialog from './SettingsDialog';


interface ScriptSidebarProps {
    sentences: string[];
    currentIndex: number;
    onSentenceSelect: (index: number) => void;
    onProcessText: (text: string) => void;
    initialText?: string;
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function ScriptSidebar({
    sentences,
    currentIndex,
    onSentenceSelect,
    onProcessText,
    initialText = '',
    isCollapsed,
    toggleSidebar
}: ScriptSidebarProps) {
    const [rawText, setRawText] = useState(initialText);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);


    useEffect(() => {
        if (initialText) setRawText(initialText);
    }, [initialText]);

    const handleProcess = () => {
        onProcessText(rawText);
    };

    if (isCollapsed) {
        return (
            <div className="script-sidebar collapsed">
                <div className="sidebar-header" style={{ justifyContent: 'center', padding: '1rem 0' }}>
                    <button className="sidebar-toggle" onClick={toggleSidebar} title="Expand Sidebar">
                        <PanelLeftOpen size={20} />
                    </button>
                </div>
                <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <button className="sidebar-toggle" onClick={() => setIsSettingsOpen(true)} title="Settings">
                        <Settings size={20} color="#666" />
                    </button>
                </div>



                <SettingsDialog
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                />
            </div >
        );
    }


    return (
        <div className="script-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Script</h2>
                <button className="sidebar-toggle" onClick={toggleSidebar} title="Collapse Sidebar">
                    <PanelLeftClose size={20} />
                </button>
            </div>

            <div className="sidebar-content">
                <textarea
                    className="script-input-area"
                    placeholder="Enter your script here..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                />
                <button className="process-button" onClick={handleProcess}>
                    Update Script
                </button>

                <h3 className="sidebar-title" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                    SCENES ({sentences.length})
                </h3>

                <ul className="sentence-list">
                    {sentences.map((sentence, idx) => (
                        <li
                            key={idx}
                            className={`sentence-item ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => onSentenceSelect(idx)}
                        >
                            <span style={{ marginRight: '8px', opacity: 0.5, fontSize: '0.8rem' }}>{idx + 1}.</span>
                            {sentence}
                        </li>
                    ))}
                    {sentences.length === 0 && (
                        <li style={{ color: '#666', fontStyle: 'italic', padding: '0.5rem' }}>
                            Parse text to see scenes...
                        </li>
                    )}
                </ul>
            </div>


            <SettingsDialog
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div >
    );

}
