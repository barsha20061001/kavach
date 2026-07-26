import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "kavach-user";
const TOKEN_STORAGE_KEY = "kavach-token";

const DEFAULT_DEMO_USER = {
  id: "KP-ADMIN-001",
  name: "Karnataka Police",
  initials: "KP",
  email: "analyst@kavach.ai",
  employeeId: "KP-ADMIN-001",
  role: "Crime Intelligence Analyst",
  department: "Karnataka State Police",
  district: "All Karnataka",
  phone: "Not provided",
  lastLogin: null,
};

function readStoredUser() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(USER_STORAGE_KEY) || "null",
    );

    return saved && typeof saved === "object"
      ? saved
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  function login({ email, password }) {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const normalizedPassword = String(password || "");

    if (!normalizedEmail || !normalizedPassword) {
      throw new Error("Email and password are required.");
    }

    const validEmail =
      normalizedEmail === "analyst@kavach.ai";

    const validPassword =
      normalizedPassword === "Kavach@123";

    if (!validEmail || !validPassword) {
      throw new Error("Invalid email or password.");
    }

    const authenticatedUser = {
      ...DEFAULT_DEMO_USER,
      email: normalizedEmail,
      lastLogin: new Date().toISOString(),
    };

    const demoToken = `kavach-demo-${Date.now()}`;

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(authenticatedUser),
    );

    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      demoToken,
    );

    setUser(authenticatedUser);

    window.dispatchEvent(
      new CustomEvent("kavach-auth-updated", {
        detail: authenticatedUser,
      }),
    );

    return authenticatedUser;
  }

  function logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    setUser(null);

    window.dispatchEvent(
      new CustomEvent("kavach-auth-updated", {
        detail: null,
      }),
    );
  }

  function updateProfile(updates) {
    const updatedUser = {
      ...user,
      ...updates,
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(updatedUser),
    );

    setUser(updatedUser);

    window.dispatchEvent(
      new CustomEvent("kavach-auth-updated", {
        detail: updatedUser,
      }),
    );

    return updatedUser;
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      updateProfile,
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}