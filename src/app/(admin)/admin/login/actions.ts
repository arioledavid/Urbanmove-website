"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn } from "@/auth";
import {
  loginAttemptKey,
  loginRateLimitService,
} from "@/lib/services/login-rate-limit-service";

export type LoginState = {
  error?: string;
  redirectTo?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 12) {
    return { error: "Invalid email or password." };
  }

  const headerStore = await headers();
  const clientIp =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  if (process.env.NODE_ENV === "production") {
    const rate = await loginRateLimitService.check(
      loginAttemptKey(clientIp, email),
    );
    if (rate.success && !rate.data.allowed) {
      const minutes = Math.max(1, Math.ceil(rate.data.retryAfterSec / 60));
      return {
        error: `Too many failed attempts. Try again in about ${minutes} minute(s).`,
      };
    }
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "").trim();
  const redirectTo =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl === "/"
        ? "/dashboard"
        : callbackUrl
      : "/dashboard";

  try {
    const redirectUrl = await signIn("credentials", {
      email,
      password,
      redirectTo,
      redirect: false,
    });

    return { redirectTo: redirectUrl };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }

    throw error;
  }
}
