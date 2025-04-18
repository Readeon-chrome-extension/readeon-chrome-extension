/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import type { PluginOption } from 'vite';
import MagicString from 'magic-string';

/**
 * solution for multiple content scripts
 */
export default function inlineVitePreloadScript(): PluginOption {
  let __vitePreload = '';
  return {
    name: 'replace-vite-preload-script-plugin',
    async renderChunk(code, chunk, options, meta) {
      if (!/content/.test(chunk.fileName)) {
        return null;
      }
      if (!__vitePreload) {
        const chunkName: string | undefined = Object.keys(meta.chunks).find(key => /preload/.test(key));
        const modules = meta.chunks?.[chunkName]?.modules;
        __vitePreload = modules?.[Object.keys(modules)?.[0]]?.code;
        __vitePreload = __vitePreload?.replaceAll('const ', 'var ');
        if (!__vitePreload) {
          return null;
        }
      }
      return {
        code: __vitePreload + code.split(`\n`).slice(1).join(`\n`),
        map: new MagicString(code).generateMap({ hires: true }),
      };
    },
  };
}
