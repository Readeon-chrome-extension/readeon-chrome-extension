/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import * as path from 'path';
import { readFileSync } from 'fs';
import type { PluginOption } from 'vite';

const DUMMY_CODE = `export default function(){};`;

function getInjectionCode(fileName: string): string {
  return readFileSync(path.resolve(__dirname, '..', 'reload', 'injections', fileName), { encoding: 'utf8' });
}

type Config = {
  isDev: boolean;
  background: boolean;
  view: boolean;
};

export default function addHmr(config: Config): PluginOption {
  const { background, view, isDev } = config;
  const idInBackgroundScript = 'virtual:reload-on-update-in-background-script';
  const idInView = 'virtual:reload-on-update-in-view';

  const scriptHmrCode = isDev ? getInjectionCode('script.js') : DUMMY_CODE;
  const viewHmrCode = isDev ? getInjectionCode('view.js') : DUMMY_CODE;

  return {
    name: 'add-hmr',
    resolveId(id) {
      if (id === idInBackgroundScript || id === idInView) {
        return getResolvedId(id);
      }
    },
    load(id) {
      if (id === getResolvedId(idInBackgroundScript)) {
        return background ? scriptHmrCode : DUMMY_CODE;
      }

      if (id === getResolvedId(idInView)) {
        return view ? viewHmrCode : DUMMY_CODE;
      }
    },
  };
}

function getResolvedId(id: string) {
  return '\0' + id;
}
