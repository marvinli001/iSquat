import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export default async function SessionControls() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link className="btn primary" href="/auth">
        Sign in
      </Link>
    );
  }

  const dashboardLink = user.role === "admin" ? "/admin" : "/dashboard";
  const dashboardLabel = user.role === "admin" ? "Admin" : "Dashboard";

  return (
    <>
      <Link className="btn ghost" href={dashboardLink}>
        {dashboardLabel}
      </Link>
      <form action={signOut}>
        <button className="btn ghost" type="submit">
          Sign out
        </button>
      </form>
    </>
  );
}
