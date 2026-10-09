"use client";

import { useEffect, useState } from "react";
import { Check, Plus, ShieldCheck, UserRound, Users } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/page-header";
import { ErrorState, LoadingState } from "@/components/data-state";
import { api } from "@/lib/api";

type Permission = { key: string; name: string; description?: string | null };
type Role = { id: string; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; members: number; permissions: string[] };
type PendingUser = { id: string; name: string | null; email: string; status: string };

export default function SettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [newRoleName, setNewRoleName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selected = roles.find((role) => role.id === selectedId);

  useEffect(() => {
    Promise.all([api<{ roles: Role[] }>("/roles"), api<{ permissions: Permission[] }>("/permissions"), api<{ users: PendingUser[] }>("/users")])
      .then(([roleResult, permissionResult, userResult]) => {
        setRoles(roleResult.roles); setPermissions(permissionResult.permissions);
        setPendingUsers(userResult.users.filter((user) => user.status === "PENDING"));
        if (roleResult.roles[0]) setSelectedId(roleResult.roles[0].id);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load access settings"))
      .finally(() => setLoading(false));
  }, []);

  function togglePermission(key: string) {
    if (!selected || selected.isSystem) return;
    setRoles((current) => current.map((role) => role.id === selected.id ? { ...role, permissions: role.permissions.includes(key) ? role.permissions.filter((item) => item !== key) : [...role.permissions, key] } : role));
  }
  async function savePermissions() {
    if (!selected) return;
    try { await api(`/roles/${selected.id}/permissions`, { method: "PUT", body: JSON.stringify({ permissions: selected.permissions }) }); toast.success("Permissions saved"); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to save permissions"); }
  }
  async function createRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const name = newRoleName.trim(); if (!name) return;
    try { const result = await api<{ role: Role }>("/roles", { method: "POST", body: JSON.stringify({ name }) }); setRoles((current) => [...current, result.role]); setSelectedId(result.role.id); setNewRoleName(""); setShowCreate(false); toast.success("Role saved"); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to create role"); }
  }
  async function assignUser(userId: string) {
    const roleId = assignments[userId]; if (!roleId) return toast.error("Choose a role first");
    try { await api(`/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ roleId }) }); setPendingUsers((current) => current.filter((user) => user.id !== userId)); toast.success("Role assigned"); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to assign role"); }
  }
  async function toggleRole(role: Role) {
    if (role.isSystem) return;
    try { const result = await api<{ role: Role }>(`/roles/${role.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !role.isActive }) }); setRoles((current) => current.map((item) => item.id === role.id ? { ...item, isActive: result.role.isActive } : item)); toast.success(result.role.isActive ? "Role enabled" : "Role disabled"); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to change role status"); }
  }

  if (error) return <ErrorState message={error} />;
  if (loading || !selected) return <LoadingState label="Loading access settings" />;
  return <>
    <PageHeader title="Settings" subtitle="Create roles and grant capabilities from the database." action={<button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#17221d] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17} />Create role</button>} />
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#dbe8dc] bg-[#f0f7f0] p-4 text-sm text-[#49634f]"><ShieldCheck size={20} /><p><strong>Dynamic access control.</strong> Roles, permissions, and assignments are stored in PostgreSQL.</p></div>
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <section className="rounded-xl border border-[#e0e7e1] bg-white p-4"><h2 className="font-semibold text-[#17221d]">Roles</h2><p className="mt-1 text-xs text-[#829087]">{roles.length} database roles</p><div className="mt-4 space-y-1">{roles.map((role) => <div key={role.id} className={`rounded-lg p-3 ${role.id === selected.id ? "bg-[#edf3ed]" : "hover:bg-[#f7f8f6]"}`}><button onClick={() => setSelectedId(role.id)} className="w-full text-left"><div className="flex justify-between"><span className="font-medium text-[#17221d]">{role.name}</span><span className={`text-xs ${role.isActive ? "text-[#477050]" : "text-red-600"}`}>{role.isSystem ? "Protected" : role.isActive ? "Enabled" : "Disabled"}</span></div><p className="mt-1 text-xs text-[#829087]">{role.description ?? role.slug} · {role.members} members</p></button>{!role.isSystem && <button onClick={() => toggleRole(role)} className="mt-2 text-xs font-semibold text-[#365341]">{role.isActive ? "Disable role" : "Enable role"}</button>}</div>)}</div></section>
      <section className="rounded-xl border border-[#e0e7e1] bg-white p-6"><div className="flex items-start justify-between border-b border-[#edf0ed] pb-5"><div><h2 className="text-xl font-semibold text-[#17221d]">{selected.name}</h2><p className="mt-1 text-sm text-[#829087]">{selected.isSystem ? "System role permissions are protected." : "Choose capabilities for this role."}</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#f2f5f2] px-3 py-1.5 text-xs text-[#5a6d60]"><Users size={14} />{selected.members}</span></div><div className="grid gap-3 pt-5 sm:grid-cols-2">{permissions.map((permission) => { const enabled = selected.permissions.includes(permission.key); return <button key={permission.key} disabled={selected.isSystem} onClick={() => togglePermission(permission.key)} className={`flex items-center justify-between rounded-lg border p-4 text-left ${enabled ? "border-[#c8ddca] bg-[#f4faf4]" : "border-[#e5eae6]"}`}><span><span className="block text-sm font-medium text-[#17221d]">{permission.name}</span><span className="mt-1 block text-xs text-[#829087]">{permission.key}</span></span><span className={`grid size-6 place-items-center rounded-full border ${enabled ? "border-[#477050] bg-[#477050] text-white" : "border-[#cbd4cd] text-transparent"}`}><Check size={14} /></span></button>; })}</div><button disabled={selected.isSystem} onClick={savePermissions} className="mt-6 rounded-lg bg-[#17221d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save permissions</button></section>
    </div>
    <section className="mt-6 rounded-xl border border-[#e0e7e1] bg-white p-6"><div className="flex items-center gap-3"><UserRound size={20} className="text-[#936c36]" /><div><h2 className="font-semibold text-[#17221d]">Pending users</h2><p className="mt-1 text-sm text-[#829087]">Assign a database role before a new account receives school data.</p></div></div><div className="mt-4 divide-y divide-[#edf0ed]">{pendingUsers.length === 0 ? <p className="py-4 text-sm text-[#829087]">No pending users.</p> : pendingUsers.map((user) => <div key={user.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-[#17221d]">{user.name ?? "Unnamed user"}</p><p className="text-xs text-[#829087]">{user.email}</p></div><div className="flex gap-2"><select value={assignments[user.id] ?? ""} onChange={(event) => setAssignments((current) => ({ ...current, [user.id]: event.target.value }))} className="h-10 rounded-lg border border-[#d9e2db] px-3 text-sm"><option value="" disabled>Assign role</option>{roles.filter((role) => !role.isSystem).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select><button onClick={() => assignUser(user.id)} className="rounded-lg bg-[#edf3ed] px-3 text-sm font-semibold text-[#365341]">Assign</button></div></div>)}</div></section>
    {showCreate && <div className="fixed inset-0 z-40 grid place-items-center bg-[#17221d]/30 p-5"><form onSubmit={createRole} className="w-full max-w-md rounded-xl bg-white p-6"><h2 className="text-xl font-semibold text-[#17221d]">Create a role</h2><input autoFocus required value={newRoleName} onChange={(event) => setNewRoleName(event.target.value)} placeholder="Role name" className="mt-5 h-12 w-full rounded-lg border border-[#d9e2db] px-4 text-sm" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg px-4 py-2 text-sm text-[#68756d]">Cancel</button><button className="rounded-lg bg-[#17221d] px-4 py-2 text-sm font-semibold text-white">Create</button></div></form></div>}
  </>;
}
