import './LoadingStore.css';
import loadingVideo from './images/original-2f9b699a4f79d031ab97478a41c2056d.mp4';

/**
 * LoadingStore - Video-based loader for shop sections
 */
export default function LoadingStore({ text = "We are building your store" }) {
  return (
    <div className="loading-store-wrapper">
      <div className="loading-store-content">
        <video
          className="loading-store-video"
          src={loadingVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <p className="loading-store-text">{text}</p>
      </div>
    </div>
  );
}
