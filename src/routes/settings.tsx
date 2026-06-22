import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app/AppHeader";
import { SectionCard } from "@/components/app/KpiCard";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SkyIntel" }] }),
  component: SettingsPage,
});

const inputCls = "w-full h-10 px-3 rounded-md border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

function Toggle({ label, hint, defaultChecked = false }: { label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0 cursor-pointer">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <div className="relative w-10 h-6 rounded-full bg-secondary/60 peer-checked:bg-primary transition-colors shrink-0 mt-0.5">
        <div className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}

function SettingsPage() {
  return (
    <div className="min-h-screen">
      <AppHeader title="Settings" subtitle="Workspace preferences" />
      <div className="p-6 max-w-4xl space-y-6">
        <SectionCard title="User Profile">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</span><input defaultValue="Maya Rao" className={inputCls + " mt-1.5"} /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span><input defaultValue="maya@skyintel.io" className={inputCls + " mt-1.5"} /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</span><select className={inputCls + " mt-1.5"}><option>Operations Analyst</option><option>Data Scientist</option><option>Admin</option></select></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Zone</span><select className={inputCls + " mt-1.5"}><option>America/New_York</option><option>UTC</option></select></label>
          </div>
        </SectionCard>

        <SectionCard title="Theme Preferences">
          <Toggle label="Dark mode" hint="Use the moon icon in the header to toggle" />
          <Toggle label="Compact tables" hint="Reduce table row height" defaultChecked />
          <Toggle label="Animated charts" hint="Smooth chart transitions" defaultChecked />
        </SectionCard>

        <SectionCard title="Notification Preferences">
          <Toggle label="Critical delay alerts" hint="When delay probability exceeds 80%" defaultChecked />
          <Toggle label="Daily ops digest" hint="Sent every morning at 6:00 local" defaultChecked />
          <Toggle label="Model performance alerts" hint="When accuracy drops more than 2pp" defaultChecked />
          <Toggle label="Weekly route review" hint="Routes with worsening risk score" />
        </SectionCard>

      </div>
    </div>
  );
}
