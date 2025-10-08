"use server";

import z from "zod";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "./SignUpForm";
import { Argon2id } from "oslo/password";
import { lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { signInSchema } from "./SignInForm";
import { redirect } from "next/navigation";
import { generateCodeVerifier, generateState } from "arctic";
import { googleOAuthClient } from "@/lib/googleOAuth";

export const signUp = async (values: z.infer<typeof signUpSchema>) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });

    if (existingUser) {
      return { error: "User already exists", success: false };
    }

    const hashedPassword = await new Argon2id().hash(values.password);

    const user = await prisma.user.create({
      data: {
        email: values.email.toLowerCase(),
        name: values.name,
        hashedPassword,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Set the session cookie on the client
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Return success object
    return { success: true };
  } catch {
    // Handle any errors during session/cookie creation or other unexpected errors
    return { error: "Something went wrong", success: false };
  }
};

export const signIn = async (values: z.infer<typeof signInSchema>) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });

    if (!user || !user.hashedPassword) {
      return { success: false, error: "Invalid Credentials!" };
    }

    const passwordMatch = await new Argon2id().verify(
      user.hashedPassword,
      values.password,
    );

    if (!passwordMatch) {
      return { success: false, error: "Invalid Credentials!" };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Set the session cookie on the client
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Return success object
    return { success: true };
  } catch {
    // Handle any errors during session/cookie creation or other unexpected errors
    return { error: "Something went wrong", success: false };
  }
};

export const logOut = async () => {
  // Create a blank (invalid) session cookie
  const sessionCookie = lucia.createBlankSessionCookie();

  // Overwrite the existing session cookie in the browser, effectively logging the user out
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/authenticate");
};

export const getGoogleOauthConsentUrl = async () => {
  try {
    // Generate secure, random values for OAuth security
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    // 1. Set the 'codeVerifier' cookie
    (await cookies()).set("codeVerifier", codeVerifier, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
      // 'maxAge' is typically set here as well, but not visible
    });

    // 2. Set the 'state' cookie
    (await cookies()).set("state", state, {
      // The image incorrectly shows 'codeVerifier' here, but it should be 'state'
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
      // 'maxAge' is typically set here as well, but not visible
    });

    const scopes = ["email", "profile"];
    const authUrl = googleOAuthClient.createAuthorizationURL(
      state,
      codeVerifier,
      scopes,
    );

    // Return the generated URL upon success
    return { success: true, url: authUrl.toString() };
  } catch {
    return { success: false, error: "Something went wrong" };
  }
};
