"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { ErrorState, LoadingState } from "@/components/data-state";

type UserRow = { id: string; name: string | null; email: string; status: string; createdAt: string; role: { name: string; slug: string } | null };
export default function UsersPage() { const [users, setUsers] = useState<UserRow[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); useEffect(() => { api<{ users: UserRow[] }>("/users").then((result) => setUsers(result.users)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load users")).finally(() => setLoading(false)); }, []); return <><PageHeader title="Users" subtitle="Every account in the workspace, with its current access state." />{error ? <ErrorState message={error} /> : loading ? <LoadingState label="Loading users" /> : users.length === 0 ? <p className="rounded-xl border border-dashed border-[#d6ded8] bg-white p-10 text-center text-sm text-[#758079]">No users yet.</p> : <DataTable columns={["Name", "Email", "Role", "Status"]} rows={users.map((user) => [user.name ?? "Unnamed user", user.email, user.role?.name ?? "No role", user.status])} />}</>; }
