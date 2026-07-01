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
    return <p className="text-xs text-emerald-400">Запрос отправлен</p>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="mbid" value={mbid} />
      <input type="hidden" name="artistMbid" value={artistMbid} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="artistName" value={artistName} />
      {coverUrl && <input type="hidden" name="coverUrl" value={coverUrl} />}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition-colors hover:border-emerald-600 hover:text-emerald-400 disabled:opacity-50"
      >
        {pending ? "Отправка..." : "Запросить"}
      </button>
      {state?.error && <p className="mt-1 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
