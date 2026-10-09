"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { AuthResponse } from "@/types";
import { normalizeUser } from "@/types";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" }); const isRegister = mode === "register";
  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    try { const result = await api<AuthResponse>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(isRegister ? form : { email: form.email, password: form.password }) }); saveAuth(result.token, normalizeUser(result.user)); setForm({ name: "", email: "", password: "" }); setShowPassword(false); toast.success(isRegister ? "Account created" : "Welcome back"); router.push("/dashboard"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to continue"); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5">
    {isRegister && <Field icon={User} label="Name"><input required minLength={2} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className={inputClass} /></Field>}
    <Field icon={Mail} label="Email"><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@school.com" className={inputClass} /></Field>
    <Field icon={Lock} label="Password"><div className="relative"><input required minLength={isRegister ? 6 : undefined} type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Enter your password" className={`${inputClass} pr-11`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a958e]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
    <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#17221d] text-sm font-semibold text-white hover:bg-[#334d3b] disabled:opacity-60">{loading && <LoaderCircle size={17} className="animate-spin" />}{isRegister ? "Create account" : "Sign in"}</button>
  </form>;
}

const inputClass = "h-12 w-full rounded-lg border border-[#d9e2db] bg-[#fbfcfb] px-4 text-sm text-[#17221d] outline-none placeholder:text-[#a0aaa3] focus:border-[#6c8872] focus:ring-2 focus:ring-[#dce9dd]";
function Field({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-medium text-[#34433a]">{label}</span><div className="relative"><Icon size={17} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#8a958e]" /><div className="pl-9">{children}</div></div></label>; }
