// app/portfolio/[handle]/page.tsx

export default async function PublicPortfolio({ params }) {
  const { handle } = params;
  // fetch latest public portfolio by handle from DB
  return (
    <main className="min-h-screen">
      {/* Render background + layout JSON (shapes/elements) */}
      <h1 className="sr-only">{handle}'s portfolio</h1>
      {/* <CanvasRenderer layout={layoutJson} /> */}
    </main>
  );
}
