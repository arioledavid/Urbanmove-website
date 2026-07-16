import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.active) {
    redirect("/login");
  }

  return (
    <AdminShell
      userEmail={session.user.email}
      userRole={session.user.role}
    >
      {children}
    </AdminShell>
  );
}
