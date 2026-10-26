import { getNote, NOTE_SLUGS } from "@/lib/iphone-notes";

/**
 * One article as a note, for the /iphone Notes app. Every published post is
 * generated at build time, so the MDX parser never runs per request and the
 * app fetches a small static JSON file only when a note is opened.
 */
export const dynamic = "force-static";
// Unknown slugs 404 instead of reaching for the filesystem at request time.
export const dynamicParams = false;

export function generateStaticParams() {
  return NOTE_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/iphone/notes/[slug]">,
) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json(note);
}
