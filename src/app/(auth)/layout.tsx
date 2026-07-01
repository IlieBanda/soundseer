export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          Soundseer
        </h1>
        {children}
      </div>
    </main>
  );
}
