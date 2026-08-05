// The `.js` extension is required even though the file on disk is `.ts`: TypeScript emits import
// specifiers verbatim, and Node's ESM resolver rejects an extensionless one. Without it the built
// package throws ERR_MODULE_NOT_FOUND on import - which this repo's bundler-style resolution hides,
// since Vite and tsc are both happy either way.
export { shadcnTheme } from "./themes/shadcn.js"
export { kumoTheme } from "./themes/kumo.js"
