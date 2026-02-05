import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import './ArticleReader.css';
import EditableSentence from './EditableSentence';

interface ArticleReaderProps {
    onSentenceChange?: (sentence: string) => void;
}

const ArticleReader = ({ onSentenceChange }: ArticleReaderProps) => {
    const [text, setText] = useState(localStorage.getItem('articleText') || '');
    const [sentences, setSentences] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wpm] = useState(200); // Words per minute

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        // Re-read from local storage if component mounts again or we can just rely on initial state.
        // If we want to support updates we might need a way to refresh.
        // But for now initial state is enough as the component will likely be unmounted/remounted.
        const storedText = localStorage.getItem('articleText');
        if (storedText) {
            setText(storedText);
        }
    }, []);

    useEffect(() => {
        // Simple sentence splitting on punctuation. 
        // This can be improved for edge cases like "Mr.", "U.S.A.", etc.
        if (!text.trim()) {
            setSentences([]);
            return;
        }
        // Split by . ! ? followed by space or end of string.
        // Keeping the delimiter in the sentence would be nice but simple split is okay for now.
        // Let's try to match sentence + delimiter.
        const match = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
        if (match) {
            setSentences(match.map(s => s.trim()));
            setCurrentIndex(0);
        } else {
            setSentences([text]);
            setCurrentIndex(0);
        }
    }, [text]);

    useEffect(() => {
        if (sentences.length > 0 && onSentenceChange) {
            onSentenceChange(sentences[currentIndex]);
        }
    }, [currentIndex, sentences, onSentenceChange]);

    useEffect(() => {
        if (isPlaying && currentIndex < sentences.length) {
            const currentSentence = sentences[currentIndex];
            const wordCount = currentSentence.split(/\s+/).length;
            // Calculate duration: (words / wpm) * 60 * 1000
            // Adding a minimum duration of 1s to avoid too fast skipping just in case
            const duration = Math.max(1000, (wordCount / wpm) * 60 * 1000);

            timerRef.current = window.setTimeout(() => {
                if (currentIndex < sentences.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setIsPlaying(false);
                }
            }, duration);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isPlaying, currentIndex, sentences, wpm]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (currentIndex < sentences.length - 1) {
            setCurrentIndex(currentIndex + 1);
            // If manually navigating, maybe pause? Or keep playing?
            // Usually keep playing if already playing, but reset timer.
            // The useEffect dependency on currentIndex handles the timer reset.
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1 && val <= sentences.length) {
            setCurrentIndex(val - 1);
        }
    };

    const handleSentenceSave = (newSentence: string) => {
        let newSentences = [...sentences];
        // If sentences array is empty (initial state), we are just setting the text
        if (newSentences.length === 0) {
            newSentences = [newSentence];
        } else {
            newSentences[currentIndex] = newSentence;
        }

        // Join with space. This assumes the user inputs punctuation. 
        // If they don't, the next regex split might merge sentences.
        const newText = newSentences.join(' ');

        setText(newText);
        localStorage.setItem('articleText', newText);
    };

    return (
        <div className="article-reader-container">

            {sentences.length > 0 ? (
                <EditableSentence
                    text={sentences[currentIndex]}
                    onSave={handleSentenceSave}
                    placeholder="Enter text to start reading..."
                />
            ) : (
                <EditableSentence
                    text=""
                    onSave={handleSentenceSave}
                    placeholder="Enter text to start reading..."
                />
            )}

            <div className="controls">
                <button className="control-btn secondary" onClick={handlePrev} disabled={currentIndex === 0} title="Previous Sentence">
                    <SkipBack size={24} />
                </button>

                <button className="control-btn primary" onClick={handlePlayPause} disabled={sentences.length === 0} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                </button>

                <button className="control-btn secondary" onClick={handleNext} disabled={currentIndex === sentences.length - 1} title="Next Sentence">
                    <SkipForward size={24} />
                </button>

                <div className="pagination-control">
                    <input
                        type="number"
                        className="page-input"
                        value={sentences.length > 0 ? currentIndex + 1 : 0}
                        onChange={handleIndexChange}
                        min={1}
                        max={sentences.length}
                        disabled={sentences.length === 0}
                    />
                    <span> / {sentences.length}</span>
                </div>
            </div>
        </div>
    );
};

export default ArticleReader;
