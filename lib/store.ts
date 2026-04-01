import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WindowType = 'board' | 'article' | 'photo' | 'rating' | 'page' | 'help' | 'license';

export interface WindowState {
  id: string;          // Format: `${type}-${slug}-${Date.now()}` to allow multiple same posts or unique
  type: WindowType;
  slug: string;        // The content slug
  title: string;       // Display title in the window bar
  icon?: string;       // Custom icon character (emoji/symbol)
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  isMaximized?: boolean;
}

interface AppState {
  // Theme state
  theme: 'system' | 'light' | 'dark';
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  toggleTheme: () => void;
  particleEnabled: boolean;
  toggleParticle: () => void;

  // Window management
  windows: WindowState[];
  activeZIndex: number;
  openWindow: (type: WindowType, slug: string, title: string, icon?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximizeWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: Partial<Pick<WindowState, 'x' | 'y' | 'width' | 'height'>>) => void;

  // Spotlight State
  isSpotlightOpen: boolean;
  spotlightQuery: string;
  setSpotlightOpen: (isOpen: boolean) => void;
  setSpotlightQuery: (query: string) => void;

  // Toast
  toastMessage: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}

const DEFAULT_WIDTH = 760;
const DEFAULT_HEIGHT = 520;
const RATING_WIDTH = 900;
const RATING_HEIGHT = 620;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Theme
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => {
    let next: 'system' | 'light' | 'dark' = 'system';
    if (state.theme === 'system') next = 'dark';
    else if (state.theme === 'dark') next = 'light';
    else next = 'system';
    return { theme: next };
  }),
  particleEnabled: true,
  toggleParticle: () => set((state) => ({ particleEnabled: !state.particleEnabled })),

  // Windows
  windows: [],
  activeZIndex: 10,
  openWindow: (type, slug, title, icon) => {
    // Check if already open (limit 1 instance per slug for simplicity, or allow multiple? Let's limit 1 for now)
    const existing = get().windows.find((w) => w.slug === slug && w.type === type);
    if (existing) {
      if (existing.minimized) {
        get().restoreWindow(existing.id);
      }
      get().focusWindow(existing.id);
      return;
    }

    if (get().windows.length >= 5) {
      alert("System Warning: Too many windows open. Close some applications first.");
      return;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const { activeZIndex } = get();

    // On mobile, auto-minimize previous windows
    let existingWindows = get().windows;
    if (isMobile) {
      existingWindows = existingWindows.map(w => ({ ...w, minimized: true }));
    }

    // Calculate offset based on existing windows
    const offset = existingWindows.length * 20;
    const w = type === 'rating' ? RATING_WIDTH : (type === 'license' ? 500 : DEFAULT_WIDTH);
    const h = type === 'rating' ? RATING_HEIGHT : (type === 'help' ? 600 : (type === 'license' ? 480 : DEFAULT_HEIGHT));

    const newWindow: WindowState = {
      id: `${type}-${slug}-${Date.now()}`,
      type,
      slug,
      title,
      icon,
      x: isMobile ? 0 : 100 + offset,
      y: isMobile ? 0 : 50 + offset,
      width: isMobile ? (typeof window !== 'undefined' ? window.innerWidth : w) : w,
      height: isMobile ? (typeof window !== 'undefined' ? window.innerHeight - 40 : h) : h,
      zIndex: activeZIndex + 1,
      minimized: false,
      isMaximized: isMobile, // default maximized on mobile
    };

    set({
      windows: [...existingWindows, newWindow],
      activeZIndex: activeZIndex + 1,
      isSpotlightOpen: false, // Auto-close spotlight when opening a window
    });
  },
  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },
  focusWindow: (id) => {
    const { windows, activeZIndex } = get();
    const target = windows.find((w) => w.id === id);
    if (!target || target.zIndex === activeZIndex) return;

    set({
      windows: windows.map((w) =>
        w.id === id ? { ...w, zIndex: activeZIndex + 1 } : w
      ),
      activeZIndex: activeZIndex + 1,
    });
  },
  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
    }));
  },
  restoreWindow: (id) => {
    const { activeZIndex } = get();
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, minimized: false, zIndex: activeZIndex + 1 }
          : w
      ),
      activeZIndex: activeZIndex + 1,
    }));
  },
  updateWindowBounds: (id, bounds) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...bounds } : w
      ),
    }));
  },
  toggleMaximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  // Spotlight
  isSpotlightOpen: false,
  spotlightQuery: '',
  setSpotlightOpen: (isOpen) => set({ isSpotlightOpen: isOpen }),
  setSpotlightQuery: (query) => set({ spotlightQuery: query }),

  // Toast
  toastMessage: null,
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
    }),
    {
      name: 'y2k-blog-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        theme: state.theme,
        windows: state.windows,
        activeZIndex: state.activeZIndex,
        particleEnabled: state.particleEnabled,
      }),
    }
  )
);
