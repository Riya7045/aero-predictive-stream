import { Search, Bell, Calendar, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [dateRange, setDateRange] = useState("12m");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Flight delays increased by 15%", time: "2 hours ago", read: false },
    { id: 2, message: "Model accuracy improved to 91.2%", time: "5 hours ago", read: false },
    { id: 3, message: "New weather alerts for JFK and LAX", time: "1 day ago", read: true },
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-primary/5 via-background to-secondary/5 backdrop-blur border-b border-border/50">
      <div className="px-6 py-4 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground truncate mt-1">{subtitle}</p>}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-card w-72">
            <Search className="size-4 text-muted-foreground" />
            <input
              placeholder="Search flights, airlines, airports…"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </div>

          <div className="hidden md:flex relative group">
            <button className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm font-medium hover:bg-secondary/40 transition-colors">
              <Calendar className="size-4 text-primary" />
              {dateRange === "12m" && "Last 12 months"}
              {dateRange === "6m" && "Last 6 months"}
              {dateRange === "3m" && "Last 3 months"}
              {dateRange === "1m" && "Last month"}
            </button>
            <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-md shadow-lg hidden group-hover:block z-50">
              <button onClick={() => handleDateRangeChange("1m")} className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${dateRange === "1m" ? "bg-primary/20 text-primary font-medium" : ""}`}>Last month</button>
              <button onClick={() => handleDateRangeChange("3m")} className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${dateRange === "3m" ? "bg-primary/20 text-primary font-medium" : ""}`}>Last 3 months</button>
              <button onClick={() => handleDateRangeChange("6m")} className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${dateRange === "6m" ? "bg-primary/20 text-primary font-medium" : ""}`}>Last 6 months</button>
              <button onClick={() => handleDateRangeChange("12m")} className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${dateRange === "12m" ? "bg-primary/20 text-primary font-medium" : ""}`}>Last 12 months</button>
            </div>
          </div>

          <button
            onClick={() => setDark((v) => !v)}
            className="size-9 grid place-items-center rounded-md border border-border bg-card hover:bg-secondary/40 transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative size-9 grid place-items-center rounded-md border border-border bg-card hover:bg-secondary/40 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive animate-pulse" />}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-md shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-muted rounded">
                    <X className="size-4" />
                  </button>
                </div>
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.map(notif => (
                      <div key={notif.id} className="px-4 py-3 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                          >
                            <X className="size-3 text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
            <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
              MR
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-medium">Maya Rao</div>
              <div className="text-[11px] text-muted-foreground">Ops Analyst</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
