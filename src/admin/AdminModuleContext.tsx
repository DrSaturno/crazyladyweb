import { createContext, useContext, useMemo, useState } from "react";
import { ADMIN_MODULES } from "./moduleRegistry";

const STORAGE_KEY = "cls_admin_modules_v2";

function defaults() {
  return ADMIN_MODULES.filter((module) => module.defaultEnabled || module.locked).map((module) => module.id);
}

function initialEnabled() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!Array.isArray(saved)) return defaults();
    return Array.from(new Set([...saved.filter((id): id is string => typeof id === "string"), ...ADMIN_MODULES.filter((module) => module.locked).map((module) => module.id)]));
  } catch {
    return defaults();
  }
}

interface ModuleValue {
  enabled: string[];
  isEnabled: (id: string) => boolean;
  toggle: (id: string) => void;
  reset: () => void;
}

const ModuleContext = createContext<ModuleValue | null>(null);

export function AdminModuleProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<string[]>(initialEnabled);
  function write(next: string[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEnabled(next);
  }
  const value = useMemo<ModuleValue>(() => ({
    enabled,
    isEnabled: (id) => enabled.includes(id),
    toggle: (id) => {
      const target = ADMIN_MODULES.find((module) => module.id === id);
      if (!target || target.locked) return;
      write(enabled.includes(id) ? enabled.filter((value) => value !== id) : [...enabled, id]);
    },
    reset: () => write(defaults()),
  }), [enabled]);
  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
}

export function useAdminModules() {
  const value = useContext(ModuleContext);
  if (!value) throw new Error("useAdminModules debe usarse dentro de AdminModuleProvider");
  return value;
}
