import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatusBadge } from "@/components/request-status-badge";
import { approveRequest, declineRequest } from "@/app/actions/requests";

export default async function RequestsPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  const requests = await prisma.musicRequest.findMany({
    where: isAdmin ? {} : { requestedById: user.id },
    include: { requestedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        <span className="ss-glow-text">Запросы</span>
      </h1>
      <p className="mt-2 mb-6 text-zinc-400">
        {isAdmin
          ? "Все запросы пользователей на добавление музыки."
          : "Ваши запросы на добавление музыки."}
      </p>

      {requests.length === 0 ? (
        <p className="text-sm text-zinc-500">Пока нет запросов.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {requests.map((request) => (
            <div
              key={request.id}
              className="ss-card flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-100">
                  {request.title}
                </p>
                <p className="truncate text-sm text-zinc-500">
                  {request.artistName}
                  {isAdmin && ` · запросил ${request.requestedBy.displayName}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <RequestStatusBadge status={request.status} />
                {isAdmin && request.status === "PENDING" && (
                  <div className="flex gap-2">
                    <form action={approveRequest.bind(null, request.id)}>
                      <button type="submit" className="ss-btn-secondary">
                        Одобрить
                      </button>
                    </form>
                    <form action={declineRequest.bind(null, request.id)}>
                      <button type="submit" className="ss-btn-danger">
                        Отклонить
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
