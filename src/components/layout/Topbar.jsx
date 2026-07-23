import { useEffect, useRef, useState } from "react";
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

const dateOptions = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last 12 months", value: "12m" },
  { label: "All records", value: "all" },
];

const languageOptions = [
  { label: "English", value: "English" },
  { label: "ಕನ್ನಡ", value: "Kannada" },
  { label: "English + ಕನ್ನಡ", value: "Bilingual" },
];

const initialNotifications = [
  {
    id: 1,
    title: "Cybercrime surge detected",
    description: "Bengaluru Urban recorded an unusual increase.",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: 2,
    title: "Repeat offender match",
    description: "One accused person appears across multiple FIR records.",
    time: "38 minutes ago",
    unread: true,
  },
  {
    id: 3,
    title: "District report generated",
    description: "The Mysuru district intelligence report is ready.",
    time: "2 hours ago",
    unread: false,
  },
];

export default function Topbar({
  sidebarCollapsed,
  onOpenMobileSidebar,
}) {
  const navigate = useNavigate();
  const topbarRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const [dateRange, setDateRange] = useState(
    () => localStorage.getItem("kavach-date-range") || "12m"
  );

  const [language, setLanguage] = useState(
    () => localStorage.getItem("kavach-language") || "English"
  );

  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const selectedDateLabel =
    dateOptions.find((option) => option.value === dateRange)?.label ||
    "Last 12 months";

  const selectedLanguageLabel =
    languageOptions.find((option) => option.value === language)?.label ||
    "English";

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        topbarRef.current &&
        !topbarRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) return;

    navigate(`/case-search?q=${encodeURIComponent(query)}`);
  };

  const handleDateChange = (value) => {
    setDateRange(value);
    localStorage.setItem("kavach-date-range", value);

    window.dispatchEvent(
      new CustomEvent("kavach-date-range-change", {
        detail: value,
      })
    );

    setOpenMenu(null);
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem("kavach-language", value);

    window.dispatchEvent(
      new CustomEvent("kavach-language-change", {
        detail: value,
      })
    );

    setOpenMenu(null);
  };

  const markNotificationRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
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
        sidebarCollapsed ? "left-20" : "left-72",
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
              onChange={(event) => setSearchText(event.target.value)}
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
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((current) =>
                  current === "date" ? null : "date"
                )
              }
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <CalendarDays size={17} />
              <span>{selectedDateLabel}</span>
              <ChevronDown size={14} />
            </button>

            {openMenu === "date" && (
              <Dropdown className="right-0 w-52">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleDateChange(option.value)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    {option.label}

                    {dateRange === option.value && (
                      <Check size={16} className="text-blue-400" />
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
                  current === "language" ? null : "language"
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
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleLanguageChange(option.value)
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    {option.label}

                    {language === option.value && (
                      <Check size={16} className="text-blue-400" />
                    )}
                  </button>
                ))}
              </Dropdown>
            )}
          </div>

          {/* Functional notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((current) =>
                  current === "notifications"
                    ? null
                    : "notifications"
                )
              }
              className="relative rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 text-slate-300 transition hover:border-slate-600 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
              )}
            </button>

            {openMenu === "notifications" && (
              <Dropdown className="right-0 w-[360px]">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      Notifications
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {unreadCount} unread
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(notification.id);
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
                              ? "bg-blue-400"
                              : "bg-slate-700",
                          ].join(" ")}
                        />

                        <div>
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {notification.description}
                          </p>

                          <p className="mt-2 text-[11px] text-slate-600">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
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
                  current === "profile" ? null : "profile"
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

function Dropdown({ children, className = "" }) {
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