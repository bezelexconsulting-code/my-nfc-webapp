import { getClientFromRequest } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(req) {
  const { client, error, status } = await getClientFromRequest(req, { includeTags: true });
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: status || 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { password: _, ...safe } = client;
  return new Response(
    JSON.stringify({
      success: true,
      client: {
        ...safe,
        tagCount: client.tags?.length ?? 0,
      },
      tags: client.tags || [],
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
