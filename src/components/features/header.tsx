export function Header({ title }: { title: string }) {
  return (
    <div className="p-6 border-b border-zinc-200">
      <h1 className="text-2xl font-bold text-black">{title}</h1>
    </div>
  );
}
