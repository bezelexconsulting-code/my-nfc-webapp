import { findOrCreateClientByGoogle, createAppToken } from "../../../../lib/auth";

export const runtime = "nodejs";

/** Allowed Google OAuth client IDs (web + Android). */
function getAllowedClientIds() {
  const ids = [];
  if (process.env.GOOGLE_CLIENT_ID) ids.push(process.env.GOOGLE_CLIENT_ID.trim());
  if (process.env.GOOGLE_ANDROID_CLIENT_ID) ids.push(process.env.GOOGLE_ANDROID_CLIENT_ID.trim());
  return ids.filter(Boolean);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const idToken = body?.idToken || body?.id_token;
    if (!idToken) {
      return new Response(
        JSON.stringify({ error: "idToken is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const allowedIds = getAllowedClientIds();
    if (allowedIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Google sign-in not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    const payload = await res.json();

    if (!res.ok || payload.error) {
      return new Response(
        JSON.stringify({ error: payload.error_description || "Invalid Google token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!allowedIds.includes(payload.aud)) {
      return new Response(
        JSON.stringify({ error: "Token audience not allowed" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const profile = {
      sub: payload.sub,
      email: payload.email || null,
      email_verified: payload.email_verified === "true",
      name: payload.name || null,
      picture: payload.picture || null,
    };

    const client = await findOrCreateClientByGoogle(profile);
    const token = createAppToken(client.id);

    const { password: _, ...safeClient } = client;
    const clientData = {
      id: safeClient.id,
      name: safeClient.name,
      email: safeClient.email,
      emailVerified: safeClient.emailVerified,
    };

    return new Response(
      JSON.stringify({
        success: true,
        client: clientData,
        tags: client.tags || [],
        tagCount: client.tags?.length ?? 0,
        token,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("POST /api/auth/google error:", e);
    return new Response(
      JSON.stringify({ error: "Google sign-in failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
