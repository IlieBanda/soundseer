"use client";

import { useActionState } from "react";
import { requestAlbum } from "@/app/actions/requests";

type Props = {
  mbid: string;
  artistMbid: string;
  title: string;
  artistName: string;
  coverUrl?: string;
};

export function RequestAlbumButton({
  mbid,
  artistMbid,
  title,
  artistName,
  coverUrl,
}: Props) {
  const [state, formAction, pending] = useActionState(requestAlbum, undefined);

  if (state?.success) {
    return (
      <p className="ss-badge bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Запрос отправлен
      </p>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="mbid" value={mbid} />
      <input type="hidden" name="artistMbid" value={artistMbid} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="artistName" value={artistName} />
      {coverUrl && <input type="hidden" name="coverUrl" value={coverUrl} />}
      <button type="submit" disabled={pending} className="ss-btn-secondary w-full">
        {pending ? "Отправка..." : "Запросить"}
      </button>
      {state?.error && <p className="mt-1 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
