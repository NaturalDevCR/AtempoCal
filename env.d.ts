/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'atemporal' {
  export default function atemporal(input?: any, timezone?: string): any
  export function unix(timestamp: number): any
}