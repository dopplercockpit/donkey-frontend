import "./SkeletonWeatherCard.css";

export default function SkeletonWeatherCard({ label = "Loading weather" }) {
  return (
    <div className="skeleton-weather-card" role="status" aria-live="polite" aria-label={label}>
      <div className="skeleton-line skeleton-line--title" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line--short" />
    </div>
  );
}
