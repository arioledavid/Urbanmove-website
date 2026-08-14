"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import {
  hashPassword,
  MIN_PASSWORD_LENGTH,
  verifyPassword,
} from "@/lib/password";
import type { Result } from "@/lib/result";

async function requireUserId(): Promise<Result<string>> {
  const session = await auth();
  if (!session?.user?.id || session.user.active === false) {
    return { success: false, error: "You must be signed in." };
  }
  return { success: true, data: session.user.id };
}

export async function updateProfileAction(
  formData: FormData,
): Promise<Result<{ name: string }>> {
  const actor = await requireUserId();
  if (!actor.success) return actor;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { success: false, error: "Name is required." };
  }

  await prisma.user.update({
    where: { id: actor.data },
    data: { name },
  });

  revalidatePath("/settings");
  revalidatePath("/admin/settings");

  return { success: true, data: { name } };
}

export async function verifyCurrentPasswordAction(
  formData: FormData,
): Promise<Result<{ verified: true }>> {
  const actor = await requireUserId();
  if (!actor.success) return actor;

  const currentPassword = String(formData.get("currentPassword") ?? "");
  if (!currentPassword) {
    return { success: false, error: "Current password is required." };
  }

  const user = await prisma.user.findUnique({
    where: { id: actor.data },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { success: false, error: "Current password is incorrect." };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }

  return { success: true, data: { verified: true } };
}

export async function changePasswordAction(
  formData: FormData,
): Promise<Result<{ changed: true }>> {
  const actor = await requireUserId();
  if (!actor.success) return actor;

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    return { success: false, error: "Current password is required." };
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirmation do not match." };
  }

  if (newPassword === currentPassword) {
    return {
      success: false,
      error: "New password must be different from your current password.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: actor.data },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { success: false, error: "Current password is incorrect." };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: actor.data },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      mustChangePassword: false,
    },
  });

  await signOut({ redirectTo: "/login" });
  return { success: true, data: { changed: true } };
}
