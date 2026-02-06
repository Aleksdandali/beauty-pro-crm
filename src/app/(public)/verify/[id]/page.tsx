export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">QR верифікація</h1>
        <p className="text-muted-foreground mt-2">ID: {id} — Coming soon</p>
      </div>
    </main>
  );
}
