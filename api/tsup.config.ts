import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"], // adjust if your entry point is different
  outDir: "dist",
  format: ["esm"], // or ['esm', 'cjs'] if you need both
  target: "node18", // or your desired Node.js version
  dts: true, // generates .d.ts files
  sourcemap: true,
  clean: true, // remove dist before build
  minify: false,
});
