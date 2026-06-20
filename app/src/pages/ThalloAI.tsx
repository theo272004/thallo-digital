// The Brand SEO Snapshot tool is a self-contained HTML app. We embed it here
// so it inherits the site route while keeping its own logic intact. Later it
// will point at the WordPress PHP backend (currently runs in demo mode).
export default function ThalloAI() {
  return (
    <iframe
      title="Thallo AI — AI Visibility Audit"
      src={`${import.meta.env.BASE_URL}thallo-ai.html`}
      style={{ width: '100%', height: 'calc(100vh - 72px)', minHeight: 640, border: 'none', display: 'block' }}
    />
  );
}
