import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Mail, Lock } from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";
import GlassCard from "../components/ui/GlassCard";
import GlassButton from "../components/ui/GlassButton";
import GlassInput from "../components/ui/GlassInput";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = useMemo(() => location.state?.from?.pathname || "/", [location.state]);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: ""
    }));

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      const response = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password
      });

      const payload = response.data?.data;

      if (!payload?.token || !payload?.user) {
        throw new Error("Invalid login response");
      }

      login({
        token: payload.token,
        user: payload.user
      });

      navigate(from, { replace: true });
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your premium realtime messaging workspace."
    >
      <GlassCard className="p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Sign in to NexTalk</h3>
            <p className="text-sm text-white/45">
              Secure access, instant sync, and realtime conversations.
            </p>
          </div>

          {serverError ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <GlassInput
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange("email")}
                className="pl-11"
                autoComplete="email"
              />
            </div>
            {errors.email ? <p className="text-xs text-red-300">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <GlassInput
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange("password")}
                className="pl-11"
                autoComplete="current-password"
              />
            </div>
            {errors.password ? <p className="text-xs text-red-300">{errors.password}</p> : null}
          </div>

          <GlassButton type="submit" loading={submitting}>
            <span>Sign In</span>
            {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
          </GlassButton>

          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <span className="text-xs text-white/40">Need an account?</span>
            <Link
              to="/register"
              className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              Create one
            </Link>
          </div>
        </form>
      </GlassCard>
    </AuthLayout>
  );
}