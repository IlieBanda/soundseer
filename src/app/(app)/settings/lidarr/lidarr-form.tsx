"use client";

import { useActionState, useState } from "react";
import { updateLidarrSettings } from "@/app/actions/settings";

type Profile = { id: number; name: string };
type RootFolder = { id: number; path: string };

type Props = {
  lidarrUrl: string;
  lidarrApiKey: string;
  lidarrRootFolder: string;
  lidarrQualityProfileId: number | null;
  lidarrMetadataProfileId: number | null;
};

export function LidarrForm(props: Props) {
  const [state, formAction, pending] = useActionState(
    updateLidarrSettings,
    undefined
  );
  const [url, setUrl] = useState(props.lidarrUrl);
  const [apiKey, setApiKey] = useState(props.lidarrApiKey);
  const [qualityProfiles, setQualityProfiles] = useState<Profile[]>([]);
  const [metadataProfiles, setMetadataProfiles] = useState<Profile[]>([]);
  const [rootFolders, setRootFolders] = useState<RootFolder[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadOptions() {
    setLoadingOptions(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/lidarr/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Не удалось загрузить данные");
        return;
      }
      setQualityProfiles(data.qualityProfiles ?? []);
      setMetadataProfiles(data.metadataProfiles ?? []);
      setRootFolders(data.rootFolders ?? []);
    } catch {
      setLoadError("Не удалось подключиться к Lidarr");
    } finally {
      setLoadingOptions(false);
    }
  }

  return (
    <form action={formAction} className="ss-card flex max-w-md flex-col gap-4 p-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lidarrUrl" className="text-sm text-zinc-400">
          URL Lidarr
        </label>
        <input
          id="lidarrUrl"
          name="lidarrUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:8686"
          required
          className="ss-input"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lidarrApiKey" className="text-sm text-zinc-400">
          API-ключ
        </label>
        <input
          id="lidarrApiKey"
          name="lidarrApiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          className="ss-input"
        />
      </div>

      <button
        type="button"
        onClick={loadOptions}
        disabled={loadingOptions || !url || !apiKey}
        className="ss-btn-secondary self-start"
      >
        {loadingOptions ? "Загрузка..." : "Загрузить профили из Lidarr"}
      </button>
      {loadError && <p className="text-sm text-red-400">{loadError}</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lidarrRootFolder" className="text-sm text-zinc-400">
          Корневая папка
        </label>
        {rootFolders.length > 0 ? (
          <select
            id="lidarrRootFolder"
            name="lidarrRootFolder"
            defaultValue={props.lidarrRootFolder}
            className="ss-input"
          >
            {rootFolders.map((rf) => (
              <option key={rf.id} value={rf.path}>
                {rf.path}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="lidarrRootFolder"
            name="lidarrRootFolder"
            defaultValue={props.lidarrRootFolder}
            placeholder="/music"
            required
            className="ss-input"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lidarrQualityProfileId" className="text-sm text-zinc-400">
          Профиль качества
        </label>
        {qualityProfiles.length > 0 ? (
          <select
            id="lidarrQualityProfileId"
            name="lidarrQualityProfileId"
            defaultValue={props.lidarrQualityProfileId ?? undefined}
            className="ss-input"
          >
            {qualityProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="lidarrQualityProfileId"
            name="lidarrQualityProfileId"
            type="number"
            defaultValue={props.lidarrQualityProfileId ?? undefined}
            required
            className="ss-input"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lidarrMetadataProfileId" className="text-sm text-zinc-400">
          Профиль метаданных
        </label>
        {metadataProfiles.length > 0 ? (
          <select
            id="lidarrMetadataProfileId"
            name="lidarrMetadataProfileId"
            defaultValue={props.lidarrMetadataProfileId ?? undefined}
            className="ss-input"
          >
            {metadataProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="lidarrMetadataProfileId"
            name="lidarrMetadataProfileId"
            type="number"
            defaultValue={props.lidarrMetadataProfileId ?? undefined}
            required
            className="ss-input"
          />
        )}
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-400">Настройки сохранены</p>
      )}
      <button type="submit" disabled={pending} className="ss-btn-primary">
        {pending ? "Проверка соединения..." : "Сохранить"}
      </button>
    </form>
  );
}
