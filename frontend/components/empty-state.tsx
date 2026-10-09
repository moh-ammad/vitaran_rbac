import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#d6ded8] bg-white px-6 text-center">
    <div className="mb-4 rounded-full bg-[#edf2ed] p-4 text-[#4a6654]"><Icon size={25} /></div>
    <h2 className="text-lg font-semibold text-[#17221d]">{title}</h2>
    <p className="mt-2 max-w-md text-sm leading-6 text-[#758079]">{description}</p>
  </div>;
}
