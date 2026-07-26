import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
  } = useAuth();

  const [email, setEmail] = useState(
    "analyst@kavach.ai",
  );

  const [password, setPassword] = useState(
    "Kavach@123",
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      login({
        email,
        password,
      });

      const destination =
        location.state?.from ||
        "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError?.message ||
          "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020817] p-5">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-[#071225] shadow-2xl lg:grid-cols-2">
        <section className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-blue-600/25 via-[#071225] to-[#020817] p-10 lg:flex">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <ShieldCheck size={30} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-white">
              Kavach AI
            </h1>

            <p className="mt-3 text-slate-400">
              Crime Intelligence Platform
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
              Karnataka FIR Intelligence
            </p>

            <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight text-white">
              Dataset-driven crime intelligence for safer and faster
              investigations.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              Access operational analytics, hotspot intelligence,
              repeat-offender analysis and dataset-backed reports.
            </p>
          </div>
        </section>

        <section className="flex min-h-[620px] items-center p-7 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <ShieldCheck size={25} />
              </div>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white">
              Sign in
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Enter your authorised Kavach AI credentials.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Email address
                </span>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-[#061124] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Password
                </span>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-[#061124] py-3 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-xs font-semibold text-blue-300">
                Demonstration credentials
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Email: analyst@kavach.ai
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Password: Kavach@123
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;