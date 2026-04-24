import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, AtSign, Lock, Mail, User } from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";
import GlassCard from "../components/ui/GlassCard";
import GlassButton from "../components/ui/GlassButton";
import GlassInput from "../components/ui/GlassInput";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
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
    let value = e.target.value;

    if (field === "username") {
      value = value.toLowerCase().replace(/\s+/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: ""
    }));

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }

    if (!form.username.trim()) {
      nextErrors.username = "Username is required";
    } else if (form.username.trim().length < 3) {
      nextErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-z0-9._]+$/.test(form.username.trim())) {
      nextErrors.username = "Only lowercase letters, numbers, dot and underscore allowed";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm your password";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match";
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
      const response = await api.post("/auth/register", {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      });

      const payload = response.data?.data;

      if (!payload?.token || !payload?.user) {
        throw new Error("Invalid register response");
      }

      login({
        token: payload.token,
        user: payload.user
      });

      navigate("/", { replace: true });
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create account right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up your premium realtime messaging workspace in seconds."
    >
      <GlassCard className="p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Create your NexTalk account</h3>
            <p className="text-sm text-white/45">
              Start private chats, rooms, live presence, and realtime collaboration.
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
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <GlassInput
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange("name")}
                className="pl-11"
                autoComplete="name"
              />
            </div>
            {errors.name ? <p className="text-xs text-red-300">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Username
            </label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <GlassInput
                type="text"
                placeholder="tilak.rawat"
                value={form.username}
                onChange={handleChange("username")}
                className="pl-11"
                autoComplete="username"
              />
            </div>
            {errors.username ? <p className="text-xs text-red-300">{errors.username}</p> : null}
          </div>

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

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <GlassInput
                  type="password"
                  placeholder="Minimum 6 chars"
                  value={form.password}
                  onChange={handleChange("password")}
                  className="pl-11"
                  autoComplete="new-password"
                />
              </div>
              {errors.password ? <p className="text-xs text-red-300">{errors.password}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <GlassInput
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="pl-11"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword ? (
                <p className="text-xs text-red-300">{errors.confirmPassword}</p>
              ) : null}
            </div>
          </div>

          <GlassButton type="submit" loading={submitting}>
            <span>Create Account</span>
            {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
          </GlassButton>

          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <span className="text-xs text-white/40">Already have an account?</span>
            <Link
              to="/login"
              className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              Sign in
            </Link>
          </div>
        </form>
      </GlassCard>
    </AuthLayout>
  );
}