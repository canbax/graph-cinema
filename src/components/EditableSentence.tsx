import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import './EditableSentence.css';

interface EditableSentenceProps {
    text: string;
    onSave: (newText: string) => void;
    placeholder?: string;
}

const EditableSentence = ({ text, onSave, placeholder }: EditableSentenceProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentText, setCurrentText] = useState(text);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Sync state with props
    useEffect(() => {
        setCurrentText(text);
    }, [text]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // Optional: select all text
            // inputRef.current.select(); 
        }
    }, [isEditing]);

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        onSave(currentText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCurrentText(text); // Reset to original
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
        // Ctrl+Enter or Cmd+Enter to save
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSave();
        }
    };

    if (isEditing) {
        return (
            <div className="editable-sentence-container editing">
                <textarea
                    name='sentence'
                    ref={inputRef}
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="editable-textarea"
                />
                <div className="editable-controls">
                    <button onClick={handleSave} className="edit-btn save" title="Save (Cmd+Enter)">
                        <Check size={20} />
                    </button>
                    <button onClick={handleCancel} className="edit-btn cancel" title="Cancel (Esc)">
                        <X size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="editable-sentence-container view"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            {text || <span style={{ opacity: 0.5 }}>{placeholder}</span>}
        </div>
    );
};

export default EditableSentence;
