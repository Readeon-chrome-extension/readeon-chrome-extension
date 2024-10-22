<div align="center" style="padding-top: 25px">
<img src="https://c14.patreon.com/quxga_Patreon_Symbol_6fff9723d3.png" width="150px" alt="logo"/>
<h1>Readeon Extension</h1>
</div>

## Table of Contents

- [Project structure](#intro)
- [Installation](#installation)
    - [Procedures](#procedures)
        - [Chrome](#chrome)
        - [Firefox](#firefox)

## Project structure <a name="intro"></a>

1. `src/config.ts` file describes routes to work with and selectors to get data and inject it into the page.
2. `src/pages/background/modules/*` files where we listen to Patreon API and fill the storage with data.
3. `src/content/ui/*` files where we inject UI elements into the page.
4. `src/shared/components/*` reusable components.
5. `src/shared/storages/*` dynamic storage which is shared between every page.

## Installation <a name="installation"></a>

## Procedures: <a name="procedures"></a>

1. Clone this repository.
2. Change `extensionDescription` and `extensionName` in messages.json
3. Install pnpm globally: `npm install -g pnpm` (check your node version >= 16.6, recommended >= 18)
4. Run `pnpm install`

## And next, depending on the needs:

### For Chrome: <a name="chrome"></a>

1. Run:
    - Dev: `pnpm dev` or `npm run dev`
    - Prod: `pnpm build` or `npm run build`
2. Open in browser - `chrome://extensions`
3. Check - `Developer mode`
4. Find and Click - `Load unpacked extension`
5. Select - `dist` folder

### For Firefox: <a name="firefox"></a>

1. Run:
    - Dev: `pnpm dev:firefox` or `npm run dev:firefox`
    - Prod: `pnpm build:firefox` or `npm run build:firefox`
2. Open in browser - `about:debugging#/runtime/this-firefox`
3. Find and Click - `Load Temporary Add-on...`
4. Select - `manifest.json` from `dist` folder

## License
This code is licensed for viewing purposes only. Any modification, redistribution, or commercial use is strictly prohibited. See the [LICENSE](LICENSE) file for more details.
