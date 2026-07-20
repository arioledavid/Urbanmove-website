import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/app/(admin)/admin/login/login-form";
import { Logo } from "@/components/brand/brand-logo";

export const metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user?.active) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-paper p-6 sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-14 w-auto" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
            Sign in to Admin
          </h1>
          <p className="mt-1 text-sm text-muted">
            Urban Move Logistics operations
          </p>
        </div>
        <LoginForm
          callbackUrl={params.callbackUrl}
          error={params.error}
        />
      </div>
    </div>
  );
}
