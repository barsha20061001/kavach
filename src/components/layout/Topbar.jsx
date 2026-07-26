import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Languages,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const dateOptions = [
  {
    label: "Last 7 days",
    value: "Last 7 days",
  },
  {
    label: "Last 30 days",
    value: "Last 30 days",
  },
  {
    label: "Last 3 months",
    value: "Last 3 months",
  },
  {
    label: "Last 6 months",
    value: "Last 6 months",
  },
  {
    label: "Last 12 months",
    value: "Last 12 months",
  },
  {
    label: "All time",
    value: "All time",
  },
];

const languageOptions = [
  {
    label: "English",
    value: "English",
  },
  {
    label: "ಕನ್ನಡ",
    value: "ಕನ್ನಡ",
  },
  {
    label: "English + ಕನ್ನಡ",
    value: "English + ಕನ್ನಡ",
  },
];

const ALERT_STORAGE_KEY =
  "kavach-acknowledged-alerts";

const ALERT_EVENT_NAME =
  "kavach-alert-status-updated";

const DEFAULT_SETTINGS = {
  language: "English + ಕನ್ನಡ",
  dateRange: "Last 30 days",
  compactInterface: false,
  notificationsEnabled: true,
  criticalAlertsEnabled: true,
  refreshInterval: "Every 5 minutes",
  auditLoggingEnabled: true,
  sessionTimeout: "30 minutes",
  defaultDistrictId: "All",
  defaultDistrictName: "All Karnataka",
  defaultStatusId: "All",
  defaultStatusName: "All statuses",
};

function loadAppSettings() {
  try {
    const savedSettings = JSON.parse(
      localStorage.getItem("kavach-settings") || "{}",
    );

    return {
      ...DEFAULT_SETTINGS,
      ...savedSettings,
    };
  } catch {
    return {
      ...DEFAULT_SETTINGS,
    };
  }
}

function loadAcknowledgedAlertIds() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ALERT_STORAGE_KEY) || "[]",
    );

    return Array.isArray(saved)
      ? saved.map(String)
      : [];
  } catch {
    return [];
  }
}

export default function Topbar({
  sidebarCollapsed,
  onOpenMobileSidebar,
}) {
  const navigate = useNavigate();
  const topbarRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const [appSettings, setAppSettings] =
    useState(loadAppSettings);

  const [notifications, setNotifications] =
    useState([]);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(true);

  const dateRange =
    appSettings.dateRange ||
    DEFAULT_SETTINGS.dateRange;

  const language =
    appSettings.language ||
    DEFAULT_SETTINGS.language;

  const selectedDateLabel =
    dateOptions.find(
      (option) => option.value === dateRange,
    )?.label || DEFAULT_SETTINGS.dateRange;

  const selectedLanguageLabel =
    languageOptions.find(
      (option) => option.value === language,
    )?.label || DEFAULT_SETTINGS.language;

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);

    try {
      const response = await api.alerts();

      const source =
        response?.alerts ??
        response?.data?.alerts ??
        response?.data ??
        response ??
        [];

      const acknowledgedIds =
        loadAcknowledgedAlertIds();

      const normalizedNotifications =
        Array.isArray(source)
          ? source.map((alert, index) => {
              const id = String(
                alert.id ??
                  alert.alertId ??
                  alert.AlertID ??
                  `alert-${index}`,
              );

              return {
                id,

                title:
                  alert.title ??
                  alert.alertTitle ??
                  alert.name ??
                  "Dataset intelligence alert",

                description:
                  alert.description ??
                  alert.message ??
                  alert.details ??
                  "No additional details are available.",

                severity: normalizeSeverity(
                  alert.severity ??
                    alert.priority ??
                    alert.level ??
                    alert.type,
                ),

                district:
                  alert.districtName ??
                  alert.district ??
                  alert.location ??
                  "",

                caseCount: toNumber(
                  alert.caseCount ??
                    alert.count ??
                    alert.totalCases,
                ),

                type:
                  alert.type ??
                  alert.category ??
                  "intelligence",

                unread:
                  !acknowledgedIds.includes(id),
              };
            })
          : [];

      normalizedNotifications.sort(
        (first, second) =>
          severityRank(second.severity) -
          severityRank(first.severity),
      );

      setNotifications(
        normalizedNotifications.slice(0, 5),
      );
    } catch (error) {
      console.error(
        "Unable to load Topbar alerts:",
        error,
      );

      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        topbarRef.current &&
        !topbarRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      const updatedSettings = {
        ...DEFAULT_SETTINGS,
        ...(event.detail || {}),
      };

      setAppSettings(updatedSettings);
    };

    const handleStorageUpdate = (event) => {
      if (
        event.key &&
        event.key !== "kavach-settings"
      ) {
        return;
      }

      setAppSettings(loadAppSettings());
    };

    window.addEventListener(
      "kavach-settings-updated",
      handleSettingsUpdate,
    );

    window.addEventListener(
      "storage",
      handleStorageUpdate,
    );

    return () => {
      window.removeEventListener(
        "kavach-settings-updated",
        handleSettingsUpdate,
      );

      window.removeEventListener(
        "storage",
        handleStorageUpdate,
      );
    };
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleAlertUpdate = () => {
      loadNotifications();
    };

    const handleAlertStorageUpdate = (event) => {
      if (
        event.key &&
        event.key !== ALERT_STORAGE_KEY
      ) {
        return;
      }

      loadNotifications();
    };

    window.addEventListener(
      ALERT_EVENT_NAME,
      handleAlertUpdate,
    );

    window.addEventListener(
      "storage",
      handleAlertStorageUpdate,
    );

    return () => {
      window.removeEventListener(
        ALERT_EVENT_NAME,
        handleAlertUpdate,
      );

      window.removeEventListener(
        "storage",
        handleAlertStorageUpdate,
      );
    };
  }, [loadNotifications]);

  const saveUpdatedSettings = (
    changedSettings,
  ) => {
    const updatedSettings = {
      ...appSettings,
      ...changedSettings,
    };

    setAppSettings(updatedSettings);

    localStorage.setItem(
      "kavach-settings",
      JSON.stringify(updatedSettings),
    );

    window.dispatchEvent(
      new CustomEvent(
        "kavach-settings-updated",
        {
          detail: updatedSettings,
        },
      ),
    );

    return updatedSettings;
  };

  const saveAcknowledgedAlertIds = (ids) => {
    const uniqueIds = [
      ...new Set(ids.map(String)),
    ];

    localStorage.setItem(
      ALERT_STORAGE_KEY,
      JSON.stringify(uniqueIds),
    );

    window.dispatchEvent(
      new CustomEvent(ALERT_EVENT_NAME, {
        detail: uniqueIds,
      }),
    );
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      return;
    }

    navigate(
      `/case-search?q=${encodeURIComponent(query)}`,
    );
  };

  const handleDateChange = (value) => {
    saveUpdatedSettings({
      dateRange: value,
    });

    window.dispatchEvent(
      new CustomEvent(
        "kavach-date-range-change",
        {
          detail: value,
        },
      ),
    );

    setOpenMenu(null);
  };

  const handleLanguageChange = (value) => {
    saveUpdatedSettings({
      language: value,
    });

    window.dispatchEvent(
      new CustomEvent(
        "kavach-language-change",
        {
          detail: value,
        },
      ),
    );

    setOpenMenu(null);
  };

  const markNotificationRead = (id) => {
    const normalizedId = String(id);

    const acknowledgedIds =
      loadAcknowledgedAlertIds();

    if (
      !acknowledgedIds.includes(normalizedId)
    ) {
      acknowledgedIds.push(normalizedId);
    }

    saveAcknowledgedAlertIds(
      acknowledgedIds,
    );

    setNotifications((current) =>
      current.map((notification) =>
        String(notification.id) ===
        normalizedId
          ? {
              ...notification,
              unread: false,
            }
          : notification,
      ),
    );
  };

  const markAllNotificationsRead = () => {
    const acknowledgedIds =
      loadAcknowledgedAlertIds();

    const visibleNotificationIds =
      notifications.map((notification) =>
        String(notification.id),
      );

    saveAcknowledgedAlertIds([
      ...acknowledgedIds,
      ...visibleNotificationIds,
    ]);

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("kavach-user");
    localStorage.removeItem("kavach-token");

    navigate("/login");
  };

  return (
    <header
      ref={topbarRef}
      className={[
        "fixed right-0 top-0 z-30 h-18",
        "border-b border-slate-800/90 bg-[#07101f]/90 backdrop-blur-xl",
        "transition-[left] duration-300",
        sidebarCollapsed
          ? "left-20"
          : "left-72",
      ].join(" ")}
    >
      <div className="flex h-full items-center justify-between gap-4 px-5 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        {/* Functional search */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-md flex-1 md:block"
        >
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value,
                )
              }
              placeholder="Search case number, accused or district..."
              className={[
                "h-10 w-full rounded-xl border border-slate-700",
                "bg-slate-900/70 pl-10 pr-4 text-sm text-slate-100",
                "outline-none transition",
                "placeholder:text-slate-500",
                "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              ].join(" ")}
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {/* Functional date filter */}
          <div
            data-tour="topbar-date"
            className="relative hidden sm:block"
          >
            <button
              type="button"
              onClick={() =>
                setOpenMenu((current) =>
                  current === "date"
                    ? null
                    : "date",
                )
              }
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <CalendarDays size={17} />

              <span>
                {selectedDateLabel}
              </span>

              <ChevronDown size={14} />
            </button>

            {openMenu === "date" && (
              <Dropdown className="right-0 w-52">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleDateChange(
                        option.value,
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    {option.label}

                    {dateRange ===
                      option.value && (
                      <Check
                        size={16}
                        className="text-blue-400"
                      />
                    )}
                  </button>
                ))}
              </Dropdown>
            )}
          </div>

          {/* Functional language menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((current) =>
                  current === "language"
                    ? null
                    : "language",
                )
              }
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Languages size={17} />

              <span className="hidden sm:inline">
                {selectedLanguageLabel}
              </span>

              <ChevronDown
                size={14}
                className="hidden sm:block"
              />
            </button>

            {openMenu === "language" && (
              <Dropdown className="right-0 w-56">
                {languageOptions.map(
                  (option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleLanguageChange(
                          option.value,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      {option.label}

                      {language ===
                        option.value && (
                        <Check
                          size={16}
                          className="text-blue-400"
                        />
                      )}
                    </button>
                  ),
                )}
              </Dropdown>
            )}
          </div>

          {/* Dataset-backed notifications */}
          <div className="relative">
            <button
              type="button"
              disabled={
                !appSettings.notificationsEnabled
              }
              onClick={() =>
                setOpenMenu((current) =>
                  current === "notifications"
                    ? null
                    : "notifications",
                )
              }
              className="relative rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Notifications"
            >
              <Bell size={18} />

              {appSettings.notificationsEnabled &&
                unreadCount > 0 && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
                )}
            </button>

            {openMenu === "notifications" &&
              appSettings.notificationsEnabled && (
                <Dropdown className="right-0 w-[360px]">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {notificationsLoading
                          ? "Loading..."
                          : `${unreadCount} unread`}
                      </p>
                    </div>

                    {!notificationsLoading &&
                      unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsRead
                          }
                          className="text-xs font-medium text-blue-400 hover:text-blue-300"
                        >
                          Mark all read
                        </button>
                      )}
                  </div>

                  <div className="max-h-80 overflow-y-auto p-2">
                    {notificationsLoading ? (
                      <div className="flex min-h-32 items-center justify-center px-4">
                        <p className="text-sm text-slate-400">
                          Loading dataset alerts...
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex min-h-32 items-center justify-center px-4 text-center">
                        <p className="text-sm text-slate-400">
                          No intelligence alerts are
                          available.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => {
                              markNotificationRead(
                                notification.id,
                              );

                              setOpenMenu(null);
                              navigate("/alerts");
                            }}
                            className={[
                              "w-full rounded-xl p-3 text-left transition hover:bg-white/5",
                              notification.unread
                                ? "bg-blue-500/5"
                                : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={[
                                  "mt-1.5 size-2 shrink-0 rounded-full",
                                  notification.unread
                                    ? severityDotClass(
                                        notification.severity,
                                      )
                                    : "bg-slate-700",
                                ].join(" ")}
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-medium text-white">
                                    {notification.title}
                                  </p>

                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityBadgeClass(
                                      notification.severity,
                                    )}`}
                                  >
                                    {
                                      notification.severity
                                    }
                                  </span>
                                </div>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  {
                                    notification.description
                                  }
                                </p>

                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                                  {notification.district && (
                                    <span>
                                      {
                                        notification.district
                                      }
                                    </span>
                                  )}

                                  {notification.caseCount >
                                    0 && (
                                    <span>
                                      {notification.caseCount.toLocaleString(
                                        "en-IN",
                                      )}{" "}
                                      cases
                                    </span>
                                  )}

                                  <span>
                                    {notification.unread
                                      ? "New"
                                      : "Acknowledged"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ),
                      )
                    )}
                  </div>

                  <div className="border-t border-slate-800 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        navigate("/alerts");
                      }}
                      className="w-full rounded-lg py-2 text-sm font-medium text-blue-400 hover:bg-white/5 hover:text-blue-300"
                    >
                      View all alerts
                    </button>
                  </div>
                </Dropdown>
              )}
          </div>

          {/* Functional profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((current) =>
                  current === "profile"
                    ? null
                    : "profile",
                )
              }
              className="ml-1 flex size-10 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
              aria-label="Open user profile"
            >
              KP
            </button>

            {openMenu === "profile" && (
              <Dropdown className="right-0 w-64">
                <div className="border-b border-slate-800 px-4 py-4">
                  <p className="font-semibold text-white">
                    Karnataka Police
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Crime Intelligence Analyst
                  </p>
                </div>

                <div className="p-2">
                  <MenuButton
                    icon={UserRound}
                    label="View profile"
                    onClick={() => {
                      setOpenMenu(null);
                      navigate("/settings");
                    }}
                  />

                  <MenuButton
                    icon={Settings}
                    label="Settings"
                    onClick={() => {
                      setOpenMenu(null);
                      navigate("/settings");
                    }}
                  />

                  <div className="my-2 border-t border-slate-800" />

                  <MenuButton
                    icon={LogOut}
                    label="Sign out"
                    danger
                    onClick={handleLogout}
                  />
                </div>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Dropdown({
  children,
  className = "",
}) {
  return (
    <div
      className={[
        "absolute top-[48px] z-50 overflow-hidden rounded-2xl",
        "border border-slate-700 bg-[#07101f] p-2",
        "shadow-2xl shadow-black/40",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-slate-300 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

function normalizeSeverity(value) {
  const severity = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    severity === "critical" ||
    severity === "severe"
  ) {
    return "Critical";
  }

  if (severity === "high") {
    return "High";
  }

  if (
    severity === "medium" ||
    severity === "moderate"
  ) {
    return "Medium";
  }

  return "Low";
}

function severityRank(severity) {
  const ranks = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return ranks[severity] ?? 0;
}

function severityDotClass(severity) {
  if (severity === "Critical") {
    return "bg-red-500";
  }

  if (severity === "High") {
    return "bg-orange-500";
  }

  if (severity === "Medium") {
    return "bg-amber-500";
  }

  return "bg-blue-400";
}

function severityBadgeClass(severity) {
  if (severity === "Critical") {
    return "bg-red-500/15 text-red-400";
  }

  if (severity === "High") {
    return "bg-orange-500/15 text-orange-400";
  }

  if (severity === "Medium") {
    return "bg-amber-500/15 text-amber-400";
  }

  return "bg-blue-500/15 text-blue-400";
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}