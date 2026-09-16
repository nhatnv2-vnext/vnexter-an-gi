export default function Loading() {
  return (
    <main className="page-loading" aria-busy="true" aria-label="Đang tải">
      <div className="page-loading-hero skeleton-block" />
      <div className="page-loading-sections">
        <div className="skeleton-block page-loading-spinner" />
        <div className="skeleton-block page-loading-weather" />
        <div className="page-loading-grid">
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      </div>
    </main>
  );
}
