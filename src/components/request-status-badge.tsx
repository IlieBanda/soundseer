const LABELS: Record<string, string> = {
  PENDING: "Ожидает одобрения",
  APPROVED: "Одобрено",
  PROCESSING: "Загружается",
  AVAILABLE: "Доступно",
  DECLINED: "Отклонено",
};

const STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  APPROVED: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
  PROCESSING: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
  AVAILABLE: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  DECLINED: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
};

const DOT_CLASS: Record<string, string> = {
  PENDING: "bg-amber-400",
  APPROVED: "bg-sky-400",
  PROCESSING: "bg-sky-400 animate-pulse",
  AVAILABLE: "bg-emerald-400",
  DECLINED: "bg-red-400",
};

export function RequestStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`ss-badge ${STYLES[status] ?? "bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[status] ?? "bg-zinc-500"}`}
      />
      {LABELS[status] ?? status}
    </span>
  );
}
