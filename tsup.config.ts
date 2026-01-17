import { defineConfig } from "tsup";

const injectFunc = `
function injectStyle(css) {
  if (!css || typeof document === 'undefined') return

  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'
          
  if(head.firstChild) {
    head.insertBefore(style, head.firstChild)
  } else {
    head.appendChild(style)
  }

  if(style.styleSheet) {
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }
}
`;

export default defineConfig({
  entry: ["src/components.tsx", "src/hooks.ts", "src/icons.tsx", "src/index.ts", "src/lib/storage.ts", "src/types.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  bundle: true,
  splitting: true,
  treeshake: "recommended",
  esbuildOptions: (options) => (options.chunkNames = "chunks/[name]-[hash]"),
  injectStyle: (css) => `${injectFunc}injectStyle(${css});`,
});
