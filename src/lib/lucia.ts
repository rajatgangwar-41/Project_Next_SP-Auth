import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

// 1. Initialize the Prisma Adapter with the session and user tables
const adapter = new PrismaAdapter(prisma.session, prisma.user);

// 2. Export the Lucia instance with configuration
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // Defines the name of the session cookie
    name: "rajat-auth-cookie",

    // Prevents the cookie from automatically expiring based on the session record's expiresAt
    // (A cookie with 'expires: false' is a session cookie that expires when the browser is closed)
    expires: false,

    // Configure cookie security attributes
    attributes: {
      // Sets the 'Secure' attribute only in the production environment
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export const getUser = async () => {
  // 1. Get the session ID from the cookie
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value || null;

  // 2. If no session ID is found, return null
  if (!sessionId) {
    return null;
  }

  // 3. Validate the session and retrieve session/user data
  const { session, user } = await lucia.validateSession(sessionId);

  try {
    // 4. Handle "fresh" session: refresh the cookie
    if (session && session.fresh) {
      // refreshing their session cookie
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }

    // 5. Handle invalid/expired session: delete the cookie
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      name: true,
      email: true,
      picture: true,
    },
  });

  return dbUser;
};
