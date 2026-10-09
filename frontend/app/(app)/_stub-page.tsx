import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export function StubPage({ title, subtitle, icon, emptyTitle, description }: { title: string; subtitle: string; icon: LucideIcon; emptyTitle: string; description: string }) { return <><PageHeader title={title} subtitle={subtitle} /><EmptyState icon={icon} title={emptyTitle} description={description} /></>; }
