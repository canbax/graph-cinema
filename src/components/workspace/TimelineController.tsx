import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TimelineControllerProps {
    isPlaying: boolean;
    currentIndex: number;
    totalSentences: number;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSeek: (index: number) => void;
}

export default function TimelineController({
    isPlaying,
    currentIndex,
    totalSentences,
    onPlayPause,
    onNext,
    onPrev,
    onSeek
}: TimelineControllerProps) {

    // Calculate progress percentage
    const progress = totalSentences > 1
        ? (currentIndex / (totalSentences - 1)) * 100
        : 0;

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (totalSentences <= 1) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, clickX / width));

        const newIndex = Math.round(percentage * (totalSentences - 1));
        onSeek(newIndex);
    };

    return (
        <div className="timeline-controller">
            <div className="playback-controls">
                <button
                    className="control-btn secondary"
                    onClick={onPrev}
                    disabled={currentIndex === 0}
                    title="Previous Scene"
                >
                    <SkipBack size={20} />
                </button>

                <button
                    className="control-btn play-pause"
                    onClick={onPlayPause}
                    disabled={totalSentences === 0}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>

                <button
                    className="control-btn secondary"
                    onClick={onNext}
                    disabled={currentIndex >= totalSentences - 1}
                    title="Next Scene"
                >
                    <SkipForward size={20} />
                </button>
            </div>

            <div className="timeline-scrubber">
                <div className="time-display">
                    {currentIndex + 1} / {totalSentences || 0}
                </div>

                <div className="progress-bar-container" onClick={handleProgressBarClick}>
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="progress-handle"
                        style={{ left: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
