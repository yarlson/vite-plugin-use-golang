import type { Plugin } from 'vite';

export interface GolangPluginOptions {
  tinygoPath?: string;
  buildDir?: string;
  optimization?: '0' | '1' | '2' | 's' | 'z';
  exportMode?: 'auto' | 'explicit' | 'main';
  cleanupDays?: number;
  generateTypes?: boolean;
}

export default function golangPlugin(options: GolangPluginOptions = {}): Plugin {
  return {
    name: 'vite-plugin-use-golang',
    enforce: 'pre',
  };
}
