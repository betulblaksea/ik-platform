import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const STORAGE_TOKEN = "token";
const STORAGE_USER = "user";

function readPersisted() {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const raw = localStorage.getItem(STORAGE_USER);
    const user = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function persistSession(token, user) {
  if (token) localStorage.setItem(STORAGE_TOKEN, token);
  else localStorage.removeItem(STORAGE_TOKEN);
  if (user != null) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_USER);
}

function clearPersisted() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [{ token, user }, setState] = useState(() => {
    const p = readPersisted();
    return { token: p.token, user: p.user };
  });

  const signIn = useCallback((session) => {
    const t = session?.token ?? null;
    const u = session?.user ?? null;
    persistSession(t, u);
    setState({ token: t, user: u });
  }, []);

  const signOut = useCallback(() => {
    clearPersisted();
    setState({ token: null, user: null });
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          if (!cancelled) {
            clearPersisted();
            setState({ token: null, user: null });
            navigate("/", { replace: true });
          }
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data.user) {
          const u = data.user;
          localStorage.setItem(STORAGE_USER, JSON.stringify(u));
          setState((prev) => ({ ...prev, user: u }));
        }
      } catch {
        /* mevcut context kullanıcısı kalsın */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  const value = useMemo(
    () => ({ token, user, signIn, signOut }),
    [token, user, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth yalnızca AuthProvider içinde kullanılmalıdır");
  }
  return ctx;
}
