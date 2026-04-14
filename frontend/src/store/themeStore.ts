import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      isDark: true, // default dark

      toggle: () =>
        set(state => {
          const next = !state.isDark
          document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
          return { isDark: next }
        }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => state => {
        // Apply theme on page load from localStorage
        if (state) {
          document.documentElement.setAttribute('data-theme', state.isDark ? 'dark' : 'light')
        }
      },
    }
  )
)
