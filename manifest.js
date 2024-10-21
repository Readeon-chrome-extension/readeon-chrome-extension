/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import fs from 'node:fs';
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  /**
   * if you want to support multiple languages, you can use the following reference
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
   */
  name: '__MSG_extensionName__',
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  permissions: ['storage', 'webRequest', 'tabs', 'management', 'webNavigation', 'scripting', 'cookies'],
  host_permissions: ['https://www.patreon.com/*', 'https://www.readeon.com/*'],

  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'ReadeonExtensionLogo-new.png',
  },

  icons: {
    16: 'ReadeonExtensionLogo-new.png',
    32: 'ReadeonExtensionLogo-new.png',
    48: 'ReadeonExtensionLogo-new.png',
    128: 'ReadeonExtensionLogo-new.png',
  },
  content_security_policy: {
    extension_pages:
      "default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://diplomatic-adelina-readeon-f63fb2a8.koyeb.app/ https://www.readeon.com/; object-src 'self';",
  },
  content_scripts: [
    {
      matches: ['https://www.patreon.com/*'],
      js: ['src/pages/injector/index.js'],
      run_at: 'document_start',
    },
    {
      matches: ['https://www.patreon.com/*', 'https://www.readeon.com/*'],
      js: ['src/pages/contentInjected/index.js'],
      run_at: 'document_start',
    },
    {
      matches: ['https://www.patreon.com/*'],
      js: ['src/pages/contentDynamicConfig/index.js'],
      run_at: 'document_end',
    },
    {
      matches: ['https://www.patreon.com/*'],
      js: ['src/pages/contentUI/index.js'],
    },
    {
      matches: ['https://www.patreon.com/*'],
      // KEY for cache invalidation
      css: ['assets/css/contentStyle<KEY>.chunk.css'],
    },
  ],
  //devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: [
        'assets/js/*.js',
        'assets/css/*.css',
        'assets/fonts/*.ttf',
        'icon-128.png',
        'icon-34.png',
        'src/pages/injectedScript/index.js',
      ],
      matches: ['*://*/*'],
    },
  ],
};

export default manifest;
