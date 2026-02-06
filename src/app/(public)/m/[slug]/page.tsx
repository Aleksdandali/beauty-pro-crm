export default async function MiniSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Міні-сайт</h1>
        <p className="text-muted-foreground mt-2">Салон: {slug} — Coming soon</p>
      </div>
    </main>
  );
}
