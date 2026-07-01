import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            className="rounded"
          />
          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Soundseer
          </h1>
        </div>
        {children}
      </div>
    </main>
  );
}
