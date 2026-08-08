import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page not-found-page">
      <div className="container not-found">
        <p className="not-found__eyebrow">404</p>
        <h1 className="not-found__title">This page wandered off</h1>
        <p className="not-found__body">
          The link you followed isn&apos;t quite here. Let&apos;s get you back to the warmth of
          Nagpur Ladies Club.
        </p>
        <div className="not-found__cta">
          <Link to="/" className="btn btn-primary btn-script">Back to Home</Link>
          <Link to="/events" className="btn btn-outline btn-script">Browse Events</Link>
        </div>
      </div>
    </main>
  );
}
