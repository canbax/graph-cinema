import "./LoadingBar.css";

interface LoadingBarProps {
  visible: boolean;
}

export default function LoadingBar({ visible }: LoadingBarProps) {
  if (!visible) return null;

  return (
    <div className="loading-bar-container">
      <div className="loading-bar-progress" />
    </div>
  );
}
