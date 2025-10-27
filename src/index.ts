import type { Plugin, ResolvedConfig } from "vite";
import { BuildManager } from "./build-manager";
import { TinyGoCompiler } from "./compiler";
import { transformGoDirective } from "./transform";

export interface GolangPluginOptions {
  tinygoPath?: string;
  buildDir?: string;
  optimization?: "0" | "1" | "2" | "s" | "z";
  exportMode?: "auto" | "explicit" | "main";
  cleanupDays?: number;
  generateTypes?: boolean;
}

export default function golangPlugin(
  options: GolangPluginOptions = {},
): Plugin {
  let config: ResolvedConfig;
  let buildManager: BuildManager;
  let compiler: TinyGoCompiler;

  const buildDir = options.buildDir || ".vite-golang";

  return {
    name: "vite-plugin-use-golang",
    enforce: "pre",

    config() {
      return {
        optimizeDeps: {
          exclude: ["/@vite-golang/**"],
          esbuildOptions: {
            plugins: [
              {
                name: "skip-golang-files",
                setup(build) {
                  // Skip files with "use golang" directive during scanning
                  build.onLoad(
                    { filter: /\.(js|ts|jsx|tsx)$/ },
                    async (args) => {
                      const fs = await import("fs/promises");
                      const content = await fs.readFile(args.path, "utf-8");
                      if (
                        content.startsWith('"use golang"') ||
                        content.startsWith("'use golang'")
                      ) {
                        // Return empty module during scanning
                        return {
                          contents: "export default {};",
                          loader: "js",
                        };
                      }
                      return null;
                    },
                  );
                },
              },
            ],
          },
        },
      };
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      buildManager = new BuildManager(buildDir);
      compiler = new TinyGoCompiler({
        tinygoPath: options.tinygoPath,
        optimization: options.optimization,
      });
    },

    async buildStart() {
      // Initialize build directory
      await buildManager.init();

      // Check TinyGo installation
      const installed = await compiler.isInstalled();
      if (!installed) {
        throw new Error(
          "[use-golang] TinyGo not found. Install from https://tinygo.org/getting-started/install/",
        );
      }

      console.log("[use-golang] Plugin initialized");
    },

    async transform(code, id, transformOptions) {
      // Skip during dependency scanning (ssr: true means it's the optimizer)
      if (transformOptions?.ssr) {
        return null;
      }

      // Only process JS/TS files
      if (!/\.[jt]sx?$/.test(id)) {
        return null;
      }

      return transformGoDirective(code, id, {
        buildManager,
        compiler,
        projectRoot: config.root,
        generateTypes: options.generateTypes !== false,
      });
    },

    resolveId(id) {
      if (id.startsWith("/@vite-golang/")) {
        return id;
      }
      return null;
    },

    async load(id) {
      if (!id.startsWith("/@vite-golang/")) {
        return null;
      }

      // Handle wasm_exec.js
      if (id === "/@vite-golang/wasm_exec.js") {
        const { execSync } = await import("child_process");
        const { readFile } = await import("fs/promises");
        const { join } = await import("path");

        try {
          const tinygoRoot = execSync("tinygo env TINYGOROOT", {
            encoding: "utf-8",
          }).trim();
          const wasmExecPath = join(tinygoRoot, "targets", "wasm_exec.js");
          const content = await readFile(wasmExecPath, "utf-8");
          return content;
        } catch (error) {
          throw new Error(
            "[use-golang] Could not find wasm_exec.js from TinyGo installation",
          );
        }
      }

      // Handle WASM files
      if (id.endsWith(".wasm")) {
        // In dev mode, return the URL directly for fetch
        // In build mode, emit as asset
        if (config.command === "serve") {
          // Dev mode: return URL for fetch
          return `export default ${JSON.stringify(id)}`;
        } else {
          // Build mode: emit as asset
          const { readFile } = await import("fs/promises");
          const { join } = await import("path");

          const path = id.slice("/@vite-golang/".length);
          const wasmPath = join(buildDir, path);

          try {
            const source = await readFile(wasmPath);
            const referenceId = this.emitFile({
              type: "asset",
              name: path.split("/").pop(),
              source,
            });

            return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`;
          } catch (error) {
            throw new Error(
              `[use-golang] Could not load WASM file: ${wasmPath}`,
            );
          }
        }
      }

      return null;
    },

    async handleHotUpdate(ctx) {
      const { handleGoHotUpdate } = await import("./hmr");
      return handleGoHotUpdate(ctx, ctx.modules);
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";

        // Serve WASM files with correct MIME type
        if (url.startsWith("/@vite-golang/") && url.endsWith(".wasm")) {
          const { readFile } = await import("fs/promises");
          const { join } = await import("path");

          const path = url.slice("/@vite-golang/".length);
          const wasmPath = join(buildDir, path);

          try {
            const wasmBuffer = await readFile(wasmPath);
            res.setHeader("Content-Type", "application/wasm");
            res.setHeader("Content-Length", wasmBuffer.length);
            res.end(wasmBuffer);
            return;
          } catch (error) {
            res.statusCode = 404;
            res.end("WASM file not found");
            return;
          }
        }

        if (url === "/__vite_plugin_golang_clean") {
          const { handleCleanCommand } = require("./cli");
          handleCleanCommand({
            buildDir,
            tinygoPath: options.tinygoPath || "tinygo",
          });
          res.statusCode = 200;
          res.end("Clean command executed");
          return;
        }

        if (url === "/__vite_plugin_golang_doctor") {
          const { handleDoctorCommand } = require("./cli");
          handleDoctorCommand({
            buildDir,
            tinygoPath: options.tinygoPath || "tinygo",
          });
          res.statusCode = 200;
          res.end("Doctor command executed");
          return;
        }

        next();
      });
    },
  };
}
