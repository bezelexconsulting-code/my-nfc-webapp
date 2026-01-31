import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-change-in-production";
const JWT_EXPIRY = "30d";

/** Profile-like object: { sub, email?, name?, picture?, email_verified? } */
export async function findOrCreateClientByGoogle(profile) {
  const googleId = profile.sub;
  const email = profile.email?.toLowerCase();

  // 1. Check if client with this googleId already exists
  let client = await prisma.client.findUnique({
    where: { googleId },
    include: { tags: true },
  });
  if (client) return client;

  // 2. Check if client with this email already exists (link accounts)
  if (email) {
    const existingClient = await prisma.client.findUnique({
      where: { email },
      include: { tags: true },
    });
    if (existingClient) {
      // Link Google account to existing email account
      client = await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          googleId,
          image: profile.picture || existingClient.image,
          emailVerified: true, // Google emails are verified
        },
        include: { tags: true },
      });
      return client;
    }
  }

  // 3. Create new client (no existing account found)
  const baseName = (profile.name || email?.split("@")[0] || "user").trim();
  let name = baseName;
  let n = 0;
  while (true) {
    const existing = await prisma.client.findUnique({ where: { name } });
    if (!existing) break;
    name = `${baseName}${++n}`;
  }

  client = await prisma.client.create({
    data: {
      name,
      email: email || null,
      emailVerified: !!profile.email_verified,
      googleId,
      image: profile.picture || null,
      password: null,
    },
    include: { tags: true },
  });
  return client;
}

/** Create a JWT for the Android app (clientId inside). */
export function createAppToken(clientId) {
  return jwt.sign({ clientId, type: "app" }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/** Verify app JWT and return payload or null. */
export function verifyAppToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.type === "app" && decoded?.clientId) return decoded;
    return null;
  } catch {
    return null;
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        name: { label: "Name or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null;
        const identifier = credentials.name.trim();
        let client = null;
        if (identifier.includes("@")) {
          client = await prisma.client.findUnique({
            where: { email: identifier },
          });
        } else {
          client = await prisma.client.findUnique({
            where: { name: identifier },
          });
        }
        if (!client || !client.password) return null;
        const valid = await compare(credentials.password, client.password);
        if (!valid) return null;
        return {
          id: String(client.id),
          name: client.name,
          email: client.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        await findOrCreateClientByGoogle(profile);
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.clientId = Number(user.id);
      }
      if (account?.provider === "google" && profile?.sub) {
        const client = await prisma.client.findUnique({
          where: { googleId: profile.sub },
        });
        if (client) token.clientId = client.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.clientId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/client/dashboard",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;

/**
 * Get authenticated client from request: Bearer token (Android) > NextAuth session > x-client-name + x-client-password headers.
 * Use in API routes: const { client, error, status } = await getClientFromRequest(req);
 */
export async function getClientFromRequest(req, options = {}) {
  const { includeTags = false } = options;

  // 1) Authorization: Bearer <token> (Android app)
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (bearerToken) {
    const payload = verifyAppToken(bearerToken);
    if (payload?.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: payload.clientId },
        include: includeTags ? { tags: true } : undefined,
      });
      if (client) return { client, error: null, status: null };
      return { client: null, error: "Client not found", status: 404 };
    }
  }

  // 2) NextAuth session (web)
  const { getServerSession } = await import("next-auth/next");
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const client = await prisma.client.findUnique({
      where: { id: session.user.id },
      include: includeTags ? { tags: true } : undefined,
    });
    if (client) return { client, error: null, status: null };
    return { client: null, error: "Client not found", status: 404 };
  }

  // 3) x-client-name + x-client-password (legacy / web)
  const identifier = req.headers.get("x-client-name");
  const clientPassword = req.headers.get("x-client-password");
  if (!identifier || !clientPassword) {
    return { client: null, error: "Client authentication required", status: 401 };
  }
  let client = null;
  if (identifier.includes("@")) {
    client = await prisma.client.findUnique({
      where: { email: identifier },
      include: includeTags ? { tags: true } : undefined,
    });
  } else {
    client = await prisma.client.findUnique({
      where: { name: identifier },
      include: includeTags ? { tags: true } : undefined,
    });
  }
  if (!client) return { client: null, error: "Client not found", status: 404 };
  if (!client.password) return { client: null, error: "Use Google sign-in for this account", status: 401 };
  const valid = await compare(clientPassword, client.password);
  if (!valid) return { client: null, error: "Invalid client credentials", status: 401 };
  return { client, error: null, status: null };
}
