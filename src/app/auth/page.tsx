import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, signUp } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";

type AuthPageProps = {
  searchParams?: { error?: string };
};

const errorCopy: Record<string, string> = {
  missing: "Please fill in all required fields.",
  weak: "Password must be at least 8 characters.",
  exists: "This email is already registered. Try signing in.",
  invalid: "Email or password is incorrect.",
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  const errorMessage = searchParams?.error
    ? errorCopy[searchParams.error]
    : null;

  return (
    <main className="page auth-page">
      <header className="sub-hero">
        <div>
          <p className="eyebrow">Member access</p>
          <h1 className="hero-title">Sign in to share reviews</h1>
          <p className="hero-subtitle">
            Verified accounts can add missing toilets, upload photos, and rate
            visits.
          </p>
        </div>
        <div className="sub-hero-actions">
          <Link className="btn ghost" href="/">
            Back to home
          </Link>
        </div>
      </header>

      {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

      <div className="auth-grid">
        <form className="panel form-panel" action={signIn}>
          <h2>Sign in</h2>
          <div className="form-field">
            <label htmlFor="signin-email">Email</label>
            <input
              autoComplete="email"
              id="signin-email"
              name="email"
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="signin-password">Password</label>
            <input
              autoComplete="current-password"
              id="signin-password"
              name="password"
              placeholder="Enter password"
              type="password"
              required
            />
          </div>
          <button className="btn primary" type="submit">
            Sign in
          </button>
          <p className="form-note">
            Admins are redirected to the approval console.
          </p>
        </form>

        <form className="panel form-panel" action={signUp}>
          <h2>Create account</h2>
          <div className="form-field">
            <label htmlFor="signup-name">Name</label>
            <input
              autoComplete="name"
              id="signup-name"
              name="name"
              placeholder="Your name"
              type="text"
            />
          </div>
          <div className="form-field">
            <label htmlFor="signup-email">Email</label>
            <input
              autoComplete="email"
              id="signup-email"
              name="email"
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="signup-password">Password</label>
            <input
              autoComplete="new-password"
              id="signup-password"
              name="password"
              placeholder="At least 8 characters"
              type="password"
              required
            />
          </div>
          <button className="btn primary" type="submit">
            Create account
          </button>
          <ul className="auth-list">
            <li>Add missing toilet locations</li>
            <li>Upload up to 3 approved photos per location, per member</li>
            <li>Rate and review verified toilets</li>
          </ul>
        </form>
      </div>
    </main>
  );
}
