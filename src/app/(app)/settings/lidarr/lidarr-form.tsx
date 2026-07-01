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
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="lidarrUrl" className="text-sm text-zinc-300">
          URL Lidarr
        </label>
        <input
          id="lidarrUrl"
          name="lidarrUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:8686"
          required
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="lidarrApiKey" className="text-sm text-zinc-300">
          API-ключ
        </label>
        <input
          id="lidarrApiKey"
          name="lidarrApiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <button
        type="button"
        onClick={loadOptions}
        disabled={loadingOptions || !url || !apiKey}
        className="self-start rounded-md border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500 disabled:opacity-50"
      >
        {loadingOptions ? "Загрузка..." : "Загрузить профили из Lidarr"}
      </button>
      {loadError && <p className="text-sm text-red-400">{loadError}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="lidarrRootFolder" className="text-sm text-zinc-300">
          Корневая папка
        </label>
        {rootFolders.length > 0 ? (
          <select
            id="lidarrRootFolder"
            name="lidarrRootFolder"
            defaultValue={props.lidarrRootFolder}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lidarrQualityProfileId" className="text-sm text-zinc-300">
          Профиль качества
        </label>
        {qualityProfiles.length > 0 ? (
          <select
            id="lidarrQualityProfileId"
            name="lidarrQualityProfileId"
            defaultValue={props.lidarrQualityProfileId ?? undefined}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lidarrMetadataProfileId" className="text-sm text-zinc-300">
          Профиль метаданных
        </label>
        {metadataProfiles.length > 0 ? (
          <select
            id="lidarrMetadataProfileId"
            name="lidarrMetadataProfileId"
            defaultValue={props.lidarrMetadataProfileId ?? undefined}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        )}
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-400">Настройки сохранены</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Проверка соединения..." : "Сохранить"}
      </button>
    </form>
  );
}
