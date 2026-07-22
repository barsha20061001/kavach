import { useEffect, useState } from "react";
import {
  Bell,
  Database,
  Languages,
  LockKeyhole,
  Moon,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";

const defaultSettings = {
  language: "English",
  dateRange: "12",
  compactMode: false,
  notifications: true,
  criticalAlerts: true,
  auditLogging: true,
  showSensitiveData: false,
  defaultDistrict: "All Karnataka",
  autoRefresh: "5",
};

function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("kavach-settings");

      return saved
        ? {
            ...defaultSettings,
            ...JSON.parse(saved),
          }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.compact =
      settings.compactMode ? "true" : "false";
  }, [settings.compactMode]);

  const updateSetting = (name, value) => {
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "kavach-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("kavach-settings");
    setSaved(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Configure interface, alerts, security and dataset preferences"
        action={
          <button
            type="button"
            onClick={saveSettings}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Save size={17} />
            Save settings
          </button>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-6">
        {saved && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Settings saved successfully.
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-2">
          <SettingsCard
            icon={Languages}
            title="Language and display"
            description="Configure the dashboard interface."
          >
            <SelectSetting
              label="Default language"
              value={settings.language}
              onChange={(value) =>
                updateSetting("language", value)
              }
              options={[
                "English",
                "Kannada",
                "English + Kannada",
              ]}
            />

            <SelectSetting
              label="Default date range"
              value={settings.dateRange}
              onChange={(value) =>
                updateSetting("dateRange", value)
              }
              options={[
                {
                  label: "Last 30 days",
                  value: "1",
                },
                {
                  label: "Last 6 months",
                  value: "6",
                },
                {
                  label: "Last 12 months",
                  value: "12",
                },
                {
                  label: "All records",
                  value: "all",
                },
              ]}
            />

            <ToggleSetting
              icon={Moon}
              label="Compact interface"
              description="Reduce spacing and card sizes."
              checked={settings.compactMode}
              onChange={(checked) =>
                updateSetting("compactMode", checked)
              }
            />
          </SettingsCard>

          <SettingsCard
            icon={Bell}
            title="Notifications and alerts"
            description="Control intelligence notifications."
          >
            <ToggleSetting
              label="Enable notifications"
              description="Show system and intelligence notifications."
              checked={settings.notifications}
              onChange={(checked) =>
                updateSetting("notifications", checked)
              }
            />

            <ToggleSetting
              label="Critical crime alerts"
              description="Notify when a critical risk pattern is detected."
              checked={settings.criticalAlerts}
              onChange={(checked) =>
                updateSetting("criticalAlerts", checked)
              }
            />

            <SelectSetting
              label="Automatic refresh interval"
              value={settings.autoRefresh}
              onChange={(value) =>
                updateSetting("autoRefresh", value)
              }
              options={[
                {
                  label: "Every 5 minutes",
                  value: "5",
                },
                {
                  label: "Every 15 minutes",
                  value: "15",
                },
                {
                  label: "Every 30 minutes",
                  value: "30",
                },
                {
                  label: "Manual refresh",
                  value: "manual",
                },
              ]}
            />
          </SettingsCard>

          <SettingsCard
            icon={LockKeyhole}
            title="Privacy and security"
            description="Configure access and accountability."
          >
            <ToggleSetting
              icon={ShieldCheck}
              label="Audit logging"
              description="Record searches, reports and sensitive data access."
              checked={settings.auditLogging}
              onChange={(checked) =>
                updateSetting("auditLogging", checked)
              }
            />

            <ToggleSetting
              label="Show sensitive information"
              description="Display full victim and accused information where authorised."
              checked={settings.showSensitiveData}
              onChange={(checked) =>
                updateSetting(
                  "showSensitiveData",
                  checked
                )
              }
            />

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm font-semibold text-amber-300">
                Restricted information
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-300">
                Sensitive information should only be available to
                authorised personnel with a valid investigative need.
              </p>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Database}
            title="Dataset preferences"
            description="Control default dataset filters."
          >
            <SelectSetting
              label="Default district"
              value={settings.defaultDistrict}
              onChange={(value) =>
                updateSetting("defaultDistrict", value)
              }
              options={[
                "All Karnataka",
                "Bengaluru Urban",
                "Mysuru",
                "Mangaluru",
                "Hubballi-Dharwad",
              ]}
            />

            <ReadOnlySetting
              label="Dataset source"
              value="Karnataka FIR Intelligence Dataset"
            />

            <ReadOnlySetting
              label="Connection status"
              value="Frontend demonstration data"
            />
          </SettingsCard>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={resetSettings}
            className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            Reset to defaults
          </button>
        </div>
      </main>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="font-semibold text-white">{title}</h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl bg-[#0b1930] p-4">
      <div>
        <p className="text-sm font-medium text-white">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-700"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SelectSetting({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-[#061124] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
      >
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;

          const optionLabel =
            typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function ReadOnlySetting({ label, value }) {
  return (
    <div className="flex justify-between gap-5 rounded-xl bg-[#0b1930] p-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-white">
        {value}
      </span>
    </div>
  );
}

export default Settings;