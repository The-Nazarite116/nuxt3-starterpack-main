import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = string
declare module "/Users/mitchhunter/Trying to Code/Nuxt /nuxt3-starterpack-main/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}