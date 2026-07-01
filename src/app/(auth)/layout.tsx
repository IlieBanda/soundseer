import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />

      <div className="ss-card relative w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl" />
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={57}
              className="relative"
            />
          </div>
          <h1 className="ss-glow-text text-center text-2xl font-semibold tracking-tight">
            Soundseer
          </h1>
        </div>
        {children}
      </div>
    </main>
  );
}
