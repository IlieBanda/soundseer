const LABELS: Record<string, string> = {
  PENDING: "Ожидает одобрения",
  APPROVED: "Одобрено",
  PROCESSING: "Загружается",
  AVAILABLE: "Доступно",
  DECLINED: "Отклонено",
};

const COLORS: Record<string, string> = {
  PENDING: "text-amber-400",
  APPROVED: "text-sky-400",
  PROCESSING: "text-sky-400",
  AVAILABLE: "text-emerald-400",
  DECLINED: "text-red-400",
};

export function RequestStatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs ${COLORS[status] ?? "text-zinc-400"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
