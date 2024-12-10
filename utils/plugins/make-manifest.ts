/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import * as fs from 'fs';
import * as path from 'path';
import colorLog from '../log';
import ManifestParser from '../manifest-parser';
import type { PluginOption } from 'vite';
import url from 'url';
import * as process from 'process';

const { resolve } = path;

const rootDir = resolve(__dirname, '..', '..');
const distDir = resolve(rootDir, 'dist');
const manifestFile = resolve(rootDir, 'manifest.js');

const getManifestWithCacheBurst = (): Promise<{ default: chrome.runtime.ManifestV3 }> => {
  const withCacheBurst = (path: string) => `${path}?${Date.now().toString()}`;
  /**
   * In Windows, import() doesn't work without file:// protocol.
   * So, we need to convert path to file:// protocol. (url.pathToFileURL)
   */
  if (process.platform === 'win32') {
    return import(withCacheBurst(url.pathToFileURL(manifestFile).href));
  }
  return import(withCacheBurst(manifestFile));
};

export default function makeManifest(
  config?: { getCacheInvalidationKey?: () => string },
  isDev?: boolean,
): PluginOption {
  function makeManifest(manifest: chrome.runtime.ManifestV3, to: string, cacheKey?: string) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    const manifestPath = resolve(to, 'manifest.json');
    if (cacheKey && manifest.content_scripts) {
      // Naming change for cache invalidation
      manifest.content_scripts.forEach(script => {
        script.css &&= script.css.map(css => css.replace('<KEY>', cacheKey));
      });
    }

    fs.writeFileSync(manifestPath, ManifestParser.convertManifestToString(manifest));

    colorLog(`Manifest file copy complete: ${manifestPath}`, 'success');
    //Adding this to replace in dev also
    globalThisCode(isDev);
  }

  return {
    name: 'make-manifest',
    buildStart() {
      this.addWatchFile(manifestFile);
    },
    async writeBundle() {
      const invalidationKey = config.getCacheInvalidationKey?.();
      const manifest = await getManifestWithCacheBurst();
      makeManifest(manifest.default, distDir, invalidationKey);
    },
  };
}
const globalThisCode = (isDev: boolean) => {
  const directoryPath = path.join(__dirname, '../../', 'dist', 'assets', 'js');
  // Read the file
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(file => {
      if (file.startsWith('index') && file.endsWith('.js')) {
        const filePath = path.join(directoryPath, file);
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            return console.log(err);
          }
          const result = isDev
            ? data.replace(/Function\("return this"\)\(\);/g, 'globalThis;')
            : data.replace(/Function\("return this"\)\(\)/g, 'globalThis');

          fs.writeFile(filePath, result, 'utf8', err => {
            if (err) return console.log(err);
            console.log(`Replaced in ${file}`);
          });
        });
      }
    });
  });
};
