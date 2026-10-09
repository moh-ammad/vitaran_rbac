"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Search as SearchIcon, Users } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ErrorState, LoadingState } from "@/components/data-state";

type Results = { query: string; classes: { id: string; name: string; grade: number }[]; resources: { id: string; title: string; type: string }[]; users: { id: string; name: string | null; email: string }[] };

export default function SearchPage() {
  const query = useSearchParams().get("q") ?? "";
  const [results, setResults] = useState<Results | null>(null); const [error, setError] = useState("");
  useEffect(() => { if (query.length < 2) return; api<Results>(`/search?q=${encodeURIComponent(query)}`).then((result) => setResults(result)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to search")); }, [query]);
  const hasResults = Boolean(results && (results.classes.length || results.resources.length || results.users.length));
  return <><PageHeader title="Search" subtitle={query ? `Results for “${query}” in your permitted workspace scope.` : "Search classes, resources, and users."} />{error ? <ErrorState message={error} /> : query.length < 2 ? <EmptySearch label="Enter at least two characters to search." /> : !results ? <LoadingState label="Searching your workspace" /> : !hasResults ? <EmptySearch label="No permitted records matched this search." /> : <div className="grid gap-6 md:grid-cols-3"><ResultGroup title="Classes" icon={GraduationCap}>{results.classes.map((item) => <Link key={item.id} href="/classes" className="block rounded-lg p-3 hover:bg-[#f4f7f4]"><p className="font-medium text-[#17221d]">{item.name}</p><p className="mt-1 text-xs text-[#829087]">Grade {item.grade}</p></Link>)}</ResultGroup><ResultGroup title="Resources" icon={BookOpen}>{results.resources.map((item) => <Link key={item.id} href={item.type === "BOOK" ? "/books" : "/question-papers"} className="block rounded-lg p-3 hover:bg-[#f4f7f4]"><p className="font-medium text-[#17221d]">{item.title}</p><p className="mt-1 text-xs capitalize text-[#829087]">{item.type.toLowerCase().replace("_", " ")}</p></Link>)}</ResultGroup><ResultGroup title="Users" icon={Users}>{results.users.map((item) => <Link key={item.id} href="/users" className="block rounded-lg p-3 hover:bg-[#f4f7f4]"><p className="font-medium text-[#17221d]">{item.name ?? "Unnamed user"}</p><p className="mt-1 text-xs text-[#829087]">{item.email}</p></Link>)}</ResultGroup></div>}</>;
}
function EmptySearch({ label }: { label: string }) { return <div className="rounded-xl border border-dashed border-[#d6ded8] bg-white p-12 text-center"><SearchIcon className="mx-auto text-[#829087]" /><p className="mt-4 text-sm text-[#758079]">{label}</p></div>; }
function ResultGroup({ title, icon: Icon, children }: { title: string; icon: typeof Users; children: React.ReactNode }) { return <section className="rounded-xl border border-[#e0e7e1] bg-white p-4"><div className="flex items-center gap-2 border-b border-[#edf0ed] pb-3"><Icon size={18} className="text-[#4a6654]" /><h2 className="font-semibold text-[#17221d]">{title}</h2></div><div className="pt-2">{children}</div></section>; }
