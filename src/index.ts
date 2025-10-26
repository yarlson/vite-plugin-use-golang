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

    async transform(code, id) {
      // Only process JS/TS files
      if (!/\.[jt]sx?$/.test(id)) {
        return null;
      }

      return transformGoDirective(code, id, {
        buildManager,
        compiler,
        projectRoot: config.root,
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

      const { isVirtualModule, loadVirtualModule } = await import(
        "./virtual-modules"
      );

      if (isVirtualModule(id)) {
        const content = await loadVirtualModule(id, buildDir);
        return content;
      }

      return null;
    },
  };
}
