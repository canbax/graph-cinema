import Whiteboard from '../Whiteboard';

interface CinemaCanvasProps {
    currentSentence: string;
}

export default function CinemaCanvas({ currentSentence }: CinemaCanvasProps) {
    return (
        <div className="cinema-canvas">
            {currentSentence ? (
                <div className="whiteboard-wrapper">
                    {/* 
                        We are reusing the existing Whiteboard component. 
                        Ideally, we might want to refactor Whiteboard to accept height/width from parent
                        or just fill standard container. 
                        The current Whiteboard has internal resize logic which might conflict,
                        so we'll need to check that.
                        For now, assuming Whiteboard renders well in a container.
                     */}
                    <Whiteboard currentSentence={currentSentence} />
                </div>
            ) : (
                <div className="canvas-placeholder">
                    <p>Enter text to generate storyboard</p>
                </div>
            )}
        </div>
    );
}
