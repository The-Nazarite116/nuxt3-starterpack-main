import { ComputedRef, Ref } from 'vue'
export type LayoutKey = string
declare module "/Users/mitchhunter/Trying to Code/Nuxt /nuxt3-starterpack-main/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: false | LayoutKey | Ref<LayoutKey> | ComputedRef<LayoutKey>
  }
}