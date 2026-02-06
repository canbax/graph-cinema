import { useState, useRef, useEffect } from 'react';
import ScriptSidebar from './ScriptSidebar';
import CinemaCanvas from './CinemaCanvas';
import TimelineController from './TimelineController';
import { splitSentences } from '../../utils/sentenceSplitter';
import './Workspace.css';

export default function WorkspaceLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [rawText, setRawText] = useState(localStorage.getItem('articleText') || '');
    const [sentences, setSentences] = useState<string[]>(() => {
        const text = localStorage.getItem('articleText') || '';
        if (!text.trim()) return [];
        const res = splitSentences(text);
        return (res && res.length > 0) ? res : [text.trim()];
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wpm] = useState(200);
    const [isWholeTextMode, setIsWholeTextMode] = useState(false);

    const timerRef = useRef<number | null>(null);

    // Effect to handle sentence parsing
    const parseText = (text: string) => {
        localStorage.setItem('articleText', text);
        if (!text.trim()) {
            setSentences([]);
            return;
        }

        const result = splitSentences(text);
        if (result && result.length > 0) {
            setSentences(result);
            setCurrentIndex(0);
        } else {
            setSentences([text.trim()]);
            setCurrentIndex(0);
        }
    };
    // Removed redundant useEffect


    const handleTextProcess = (text: string) => {
        setRawText(text);
        parseText(text);
        setIsPlaying(false); // Stop playback on new text
        setIsWholeTextMode(false);
    };

    const handleDirectConvert = (text: string) => {
        setRawText(text);
        setSentences([text]);
        setCurrentIndex(0);
        setIsPlaying(false);
        setIsWholeTextMode(true);
    };

    // Playback Logic
    useEffect(() => {
        if (isPlaying && sentences.length > 0 && currentIndex < sentences.length) {
            const currentSentence = sentences[currentIndex];
            const wordCount = currentSentence.split(/\s+/).length;
            const duration = Math.max(2000, (wordCount / wpm) * 60 * 1000); // Min 2s for better visual

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

    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleNext = () => {
        if (currentIndex < sentences.length - 1) setCurrentIndex(c => c + 1);
    };
    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(c => c - 1);
    };
    const handleSeek = (index: number) => {
        setCurrentIndex(index);
        // Optional: Pause on manual seek?
        // setIsPlaying(false);
    };

    return (
        <div className={`workspace-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <ScriptSidebar
                sentences={sentences}
                currentIndex={currentIndex}
                onSentenceSelect={setCurrentIndex}
                onProcessText={handleTextProcess}
                onDirectConvert={handleDirectConvert}
                initialText={rawText}
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isWholeTextMode={isWholeTextMode}
            />

            <CinemaCanvas
                currentSentence={sentences[currentIndex] || ''}
            />

            {!isWholeTextMode && (
                <TimelineController
                    isPlaying={isPlaying}
                    currentIndex={currentIndex}
                    totalSentences={sentences.length}
                    onPlayPause={handlePlayPause}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onSeek={handleSeek}
                />
            )}
        </div>
    );
}
