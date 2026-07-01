import { requireAdmin } from "@/lib/auth";
import {
  getQualityProfiles,
  getMetadataProfiles,
  getRootFolders,
} from "@/lib/lidarr";

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey : "";
  if (!url || !apiKey) {
    return Response.json({ error: "Укажите URL и API-ключ" }, { status: 400 });
  }

  try {
    const [qualityProfiles, metadataProfiles, rootFolders] = await Promise.all([
      getQualityProfiles({ url, apiKey }),
      getMetadataProfiles({ url, apiKey }),
      getRootFolders({ url, apiKey }),
    ]);
    return Response.json({ qualityProfiles, metadataProfiles, rootFolders });
  } catch {
    return Response.json(
      { error: "Не удалось подключиться к Lidarr" },
      { status: 502 }
    );
  }
}
