const KEY = "vhst-onboarding-completed";

export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function setOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, "1");
    window.dispatchEvent(new CustomEvent("vhst-onboarding-changed"));
  } catch {
    // ignore quota errors
  }
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("vhst-onboarding-changed"));
  } catch {
    // ignore
  }
}
