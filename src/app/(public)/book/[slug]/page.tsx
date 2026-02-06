export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Онлайн-запис</h1>
        <p className="text-muted-foreground mt-2">Салон: {slug} — Coming soon</p>
      </div>
    </main>
  );
}
