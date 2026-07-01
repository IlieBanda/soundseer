import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LidarrForm } from "./lidarr-form";

export default async function LidarrSettingsPage() {
  await requireAdmin();
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Lidarr</h1>
      <p className="mt-2 mb-6 text-zinc-400">
        Подключите Lidarr, чтобы одобренные запросы автоматически скачивались.
      </p>
      <LidarrForm
        lidarrUrl={settings?.lidarrUrl ?? ""}
        lidarrApiKey={settings?.lidarrApiKey ?? ""}
        lidarrRootFolder={settings?.lidarrRootFolder ?? ""}
        lidarrQualityProfileId={settings?.lidarrQualityProfileId ?? null}
        lidarrMetadataProfileId={settings?.lidarrMetadataProfileId ?? null}
      />
    </div>
  );
}
