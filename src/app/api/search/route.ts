import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { searchArtists } from "@/lib/musicbrainz";

export async function GET(request: NextRequest) {
  await requireUser();

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return Response.json({ artists: [] });
  }

  try {
    const artists = await searchArtists(query);
    return Response.json({
      artists: artists.map((a) => ({
        id: a.id,
        name: a.name,
        disambiguation: a.disambiguation,
        type: a.type,
        country: a.country,
      })),
    });
  } catch {
    return Response.json(
      { artists: [], error: "MusicBrainz unavailable" },
      { status: 502 }
    );
  }
}
