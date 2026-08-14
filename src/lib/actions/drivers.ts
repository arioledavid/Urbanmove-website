"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { sendDriverCredentialsEmail } from "@/lib/emails/driver-credentials-email";
import { hashPassword } from "@/lib/password";
import { err, ok, type Result } from "@/lib/result";
import { generateTemporaryPassword } from "@/lib/temp-password";

function adminLoginUrl(): string {
  const origin =
    process.env.ADMIN_ORIGIN ??
    process.env.AUTH_URL ??
    "https://admin.urbanmovelogistics.co.uk";
  return `${origin.replace(/\/$/, "")}/login`;
}

async function requireAdminActor(): Promise<Result<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id || session.user.active === false) {
    return err("You must be signed in.");
  }
  if (session.user.role !== "ADMIN") {
    return err("Only admins can manage drivers.");
  }
  return ok({ id: session.user.id });
}

function revalidateDriverPaths() {
  revalidatePath("/drivers");
  revalidatePath("/admin/drivers");
  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
}

export async function createDriverAction(
  formData: FormData,
): Promise<Result<{ email: string }>> {
  const actor = await requireAdminActor();
  if (!actor.success) return actor;

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return err("A valid email is required.");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return err("A user with that email already exists.");
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role: "DRIVER",
      active: true,
      mustChangePassword: true,
      passwordChangedAt: new Date(),
    },
  });

  const emailed = await sendDriverCredentialsEmail({
    to: user.email,
    name: user.name,
    temporaryPassword,
    loginUrl: adminLoginUrl(),
  });

  if (!emailed.success) {
    await prisma.user.delete({ where: { id: user.id } });
    return err(
      "Driver was not created because the login email could not be sent. Try again.",
    );
  }

  revalidateDriverPaths();

  return ok({ email: user.email });
}

export async function setDriverActiveAction(
  driverId: string,
  active: boolean,
): Promise<Result<{ id: string; active: boolean }>> {
  const actor = await requireAdminActor();
  if (!actor.success) return actor;

  if (!/^[a-f\d]{24}$/i.test(driverId)) {
    return err("Driver not found.");
  }

  const driver = await prisma.user.findFirst({
    where: { id: driverId, role: "DRIVER" },
    select: { id: true, active: true },
  });
  if (!driver) {
    return err("Driver not found.");
  }

  if (driver.active === active) {
    return ok({ id: driver.id, active });
  }

  const updated = await prisma.user.update({
    where: { id: driver.id },
    data: { active },
    select: { id: true, active: true },
  });

  revalidateDriverPaths();

  return ok(updated);
}

export async function resetDriverPasswordAction(
  driverId: string,
): Promise<Result<{ email: string }>> {
  const actor = await requireAdminActor();
  if (!actor.success) return actor;

  if (!/^[a-f\d]{24}$/i.test(driverId)) {
    return err("Driver not found.");
  }

  const driver = await prisma.user.findFirst({
    where: { id: driverId, role: "DRIVER" },
    select: { id: true, email: true, name: true, active: true },
  });
  if (!driver) {
    return err("Driver not found.");
  }
  if (!driver.active) {
    return err("Reactivate this driver before resetting their password.");
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await prisma.user.update({
    where: { id: driver.id },
    data: {
      passwordHash,
      mustChangePassword: true,
      passwordChangedAt: new Date(),
    },
  });

  const emailed = await sendDriverCredentialsEmail({
    to: driver.email,
    name: driver.name,
    temporaryPassword,
    loginUrl: adminLoginUrl(),
  });

  if (!emailed.success) {
    return err(
      "Password was updated, but the email could not be sent. Try again.",
    );
  }

  revalidateDriverPaths();

  return ok({ email: driver.email });
}
