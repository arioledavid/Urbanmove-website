import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsPasswordForm } from "@/components/admin/settings-password-form";
import { SettingsProfileForm } from "@/components/admin/settings-profile-form";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.active === false) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, mustChangePassword: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Update your profile and password."
      />

      {user.mustChangePassword ? (
        <div
          className="mb-6 rounded-lg border border-primary/25 bg-[#FEF2F1] px-4 py-3 text-sm text-ink"
          role="status"
        >
          Change your temporary password before continuing. You can’t use the
          rest of the app until this is done.
        </div>
      ) : null}

      <div className="grid max-w-2xl gap-6">
        {!user.mustChangePassword ? (
          <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Profile</h2>
            <SettingsProfileForm
              name={user.name ?? ""}
              email={user.email}
            />
          </section>
        ) : null}

        <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Password</h2>
          <SettingsPasswordForm />
        </section>
      </div>
    </div>
  );
}
