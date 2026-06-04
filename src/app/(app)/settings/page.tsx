"use client";

import { toast } from "sonner";
import { Sun, Moon, LogOut } from "lucide-react";
import { useUiStore, type Theme } from "@/stores/ui-store";
import { useCvs, useSetDefaultCv } from "@/hooks/use-cvs";
import { useAuth } from "@/context/AuthContext";
import { PageWrap, PageHeader, SectionLabel } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Up to two uppercase initials from a name/email, for the avatar fallback. */
function initialsOf(value: string): string {
  return (
    value
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-4">
      <div>
        <div className="text-sm font-bold">{title}</div>
        {description && <div className="mt-0.5 text-[12.5px] text-muted">{description}</div>}
      </div>
      {children}
    </div>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="panel mb-4 rounded-[var(--r-lg)] px-5 pb-4 pt-4">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const { data: cvs } = useCvs();
  const setDefault = useSetDefaultCv();
  const { user, logout } = useAuth();

  const defaultCvId = cvs?.find((c) => c.is_default)?.id ?? "";

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  const displayName = user?.fullname || user?.username || user?.email || "Account";
  const initials = initialsOf(user?.fullname || user?.username || user?.email || "?");

  return (
    <PageWrap max={720}>
      <PageHeader title="Settings" />

      <Panel label="Appearance">
        <SettingRow title="Theme" description="Switch between light and dark.">
          <div className="flex gap-1 rounded-[11px] border border-border bg-code-bg p-1">
            {themeOptions.map((o) => {
              const Icon = o.icon;
              const active = theme === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => setTheme(o.value)}
                  className={cn(
                    "flex h-[30px] items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition-colors",
                    active ? "bg-glass-strong text-fg shadow-[var(--shadow-sm)]" : "text-muted",
                  )}
                >
                  <Icon className="size-3.5" /> {o.label}
                </button>
              );
            })}
          </div>
        </SettingRow>
      </Panel>

      <Panel label="CV">
        <SettingRow title="Default CV" description="Used for matching and tailoring in chat.">
          <select
            value={defaultCvId}
            onChange={(e) =>
              setDefault.mutate(e.target.value, {
                onSuccess: () => toast.success("Default CV updated"),
              })
            }
            disabled={!cvs || cvs.length === 0}
            className="rounded-[10px] border border-border-strong bg-glass px-3 py-2 text-[13px] font-semibold text-fg outline-none disabled:opacity-50"
          >
            {!cvs || cvs.length === 0 ? (
              <option value="">No CVs uploaded</option>
            ) : (
              cvs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parsed_data?.name ?? c.filename}
                </option>
              ))
            )}
          </select>
        </SettingRow>
      </Panel>

      <Panel label="Account">
        <SettingRow title={displayName} description={user?.email ?? "Managed by the secure gateway."}>
          {user?.avatar ? (
            // External avatar URL from the auth service — a plain img avoids
            // next/image remote-host config for an arbitrary domain.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={displayName}
              width={38}
              height={38}
              className="size-[38px] rounded-[10px] object-cover"
            />
          ) : (
            <div className="grid size-[38px] place-items-center rounded-[10px] bg-accent text-sm font-bold text-accent-fg">
              {initials}
            </div>
          )}
        </SettingRow>
        <SettingRow title="Sign out" description="End your session.">
          <Button variant="outline" onClick={() => logout()}>
            <LogOut className="size-[15px]" /> Sign out
          </Button>
        </SettingRow>
      </Panel>
    </PageWrap>
  );
}
