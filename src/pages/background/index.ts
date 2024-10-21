/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import RouteMatcher from '@pages/background/modules/routeMatcher';
import Posts from '@pages/background/modules/posts';
import postsStorage from '@src/shared/storages/posts/postsStorage';
import { getCurrentTabUrl } from '@src/shared/utils/background';
import { getKey, getPostKeyByUrl } from '@src/shared/utils/posts';
import recentPostsStorage from '@src/shared/storages/recent-posts/recentPostsStorage';
import selectedFromRecentPostsStorage from '@root/src/shared/storages/recent-posts/selectedFromRecentPostsStorage';
import extEnableStorage from '@root/src/shared/storages/extEnableStorage';
import RecentPosts from '@pages/background/modules/recentPosts';
import isEnableStorage from '@root/src/shared/storages/isEnableStorage';
import routeConfig from '@root/src/route.config';
import themeStorage from '@root/src/shared/storages/themeStorage';
import postsIsLoadingStorage from '@root/src/shared/storages/posts/postsIsLoadingStorage';
import singlePostStorage from '@root/src/shared/storages/singlePostStorage';
import selectedPostAuthorStorage from '@root/src/shared/storages/posts/selectedPostAuthorStorage';
import userDataStorage from '@root/src/shared/storages/user/user-storage';

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');
const shownTabs = {};
const warningPopUp = {};
let prevRoute: string | null = '';
let prevUrl: string | null = null;

const init = async (tabDetails: chrome.webNavigation.WebNavigationTransitionCallbackDetails, isActivated?: boolean) => {
  const extEnabled = await extEnableStorage?.get();
  const singlePost = await singlePostStorage?.get();
  if (extEnabled) {
    const url = tabDetails?.url;
    const routeMatcher = new RouteMatcher();
    const currentTabUrl = url;
    const currentRoute = await routeMatcher.matchCurrentRoute(url);
    const href = new URL(currentTabUrl);

    if (!currentRoute) return;

    const posts = new Posts();
    const recentPosts = new RecentPosts();
    if (singlePost?.href === href?.pathname && singlePost?.isSinglePostView && !singlePost?.isReloaded) {
      const prevValue = await singlePostStorage.get();

      await chrome.tabs.reload();
      singlePostStorage?.add(href?.pathname, true, true, prevValue?.isValidPost);
    }
    // if previous tab was not posts or recentPosts, but current tab is posts or recentPosts then reload the page
    if (
      isActivated &&
      ((!prevRoute === null && prevUrl !== currentTabUrl) ||
        (prevRoute !== 'posts' && currentRoute?.name === 'posts') ||
        (prevRoute !== 'recentPosts' && currentRoute?.name === 'recentPosts') ||
        (prevRoute !== 'creatorPost' && currentRoute?.name === 'creatorPost'))
    ) {
      await chrome.tabs.reload();
    }
    postsIsLoadingStorage.setLoading(false).then();
    if (currentRoute?.name === 'posts' || currentRoute?.name === 'creatorPost') {
      const currentTabUrl = await getCurrentTabUrl();
      const postKey = currentRoute?.name === 'creatorPost' ? getKey(currentTabUrl) : getPostKeyByUrl(currentTabUrl);

      await postsStorage.clear(postKey);
      // await selectedFromRecentPostsStorage.clear();
      await selectedPostAuthorStorage.clear();
      posts.init();
      prevRoute = currentRoute.name;
    } else if (currentRoute?.name === 'recentPosts') {
      recentPosts.init();
      await selectedFromRecentPostsStorage.clear();
      await recentPostsStorage.clearAll();
      prevRoute = currentRoute.name;
    } else {
      prevRoute = null;
    }

    prevUrl = currentTabUrl;
  } else {
    await postsStorage.delete();
    await recentPostsStorage.delete();
    await selectedFromRecentPostsStorage.clear();
  }
};

const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

// on tab reloaded or updated
chrome.webNavigation.onHistoryStateUpdated.addListener(async details => {
  const extEnabled = await extEnableStorage?.get();

  if (extEnabled) {
    await init(details);
  }
});

//* this below listener is used to track the theme changes in the cookies

let lastThemeValue = null;
chrome.cookies.onChanged.addListener(async changeInfo => {
  if (changeInfo.cookie.name === routeConfig.themeKey) {
    const newThemeValue: string = changeInfo.cookie.value;
    if (newThemeValue !== lastThemeValue) {
      await themeStorage.setTheme(newThemeValue);
      lastThemeValue = newThemeValue;
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  reloadPatreon();
  openOrFocusTab('https://www.patreon.com', 'https://www.patreon.com');
});
const reloadPatreon = (url?: string) => {
  chrome.tabs.query({}, async tabs => {
    const isChapterView = await isEnableStorage.get();
    if (!isChapterView) await isEnableStorage.toggle();

    const patreonUrl = url ?? 'https://www.patreon.com';
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith(patreonUrl)) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
};
chrome.runtime.onMessage.addListener(request => {
  if (request.action === 'Open_PopUp') {
    chrome.action.openPopup().then();
  }
  if (request?.action === 'REFRESH_PATREON') {
    reloadPatreon();
  }
  if (request?.action === 'LOGIN_SUCCESS') {
    openOrFocusTab('https://www.patreon.com', 'https://www.patreon.com');
    reloadPatreon();
  }
  if (request.action === 'Reload_Patreon') {
    reloadPatreon();
  }
});

function isPatreonUrl(url: string) {
  return url.includes('patreon.com') && !url.includes('patreon.com/oauth2/authorize');
}
// Listen for updates to tabs (e.g., navigation, reloads)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ currentWindow: true, active: true }, tanInfo => {
      const tab = tanInfo[0];
      chrome.runtime.sendMessage({ action: 'current_url', data: tab?.url });
    });

    if (isPatreonUrl(tab.url)) {
      const patreonSession = await chrome.cookies.get({ url: 'https://www.patreon.com', name: 'session_id' });
      chrome.tabs.query({}, tanInfo => {
        const patreonTabs = tanInfo?.filter(tab => tab?.url?.startsWith('https://www.patreon.com'));

        userDataStorage.add({ isLoggedIn: !!patreonSession });
        if (patreonTabs?.length >= 2 && !warningPopUp[tabId] && patreonSession?.value) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['src/pages/contentWarningScript/index.js'],
          });
          warningPopUp[tabId] = true;
        }
      });

      if (!shownTabs[tabId] && patreonSession?.value) {
        // Check if banner has already been shown on this tab
        // Inject content script to show the banner
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['src/pages/contentBannerScript/index.js'],
        });

        // Mark this tab as having shown the banner
        shownTabs[tabId] = true;
      }
      if (!patreonSession?.value) {
        if (shownTabs[tabId]) {
          delete shownTabs[tabId];
        }
      }
    }
  }
});

// Listen for tab removal to clear stored data
chrome.tabs.onRemoved.addListener(tabId => {
  if (shownTabs[tabId]) {
    delete shownTabs[tabId];
  }
  if (warningPopUp[tabId]) {
    delete warningPopUp[tabId];
  }
});
// Listen for when the tab becomes inactive
chrome.tabs.onActivated.addListener(activeInfo => {
  const tabId = activeInfo.tabId;

  // Clear the shown status when the tab becomes inactive
  if (shownTabs[tabId]) {
    delete shownTabs[tabId];
  }
  if (warningPopUp[tabId]) {
    delete warningPopUp[tabId];
  }
});
const openOrFocusTab = (newUrl: string, baseUrl: string) => {
  chrome.tabs.query({}, tabs => {
    const existingTab = tabs.find(tab => tab.url?.startsWith(baseUrl));

    if (existingTab) {
      chrome.tabs.update(existingTab.id, { active: true, url: newUrl });
    } else {
      chrome.tabs.create({ url: newUrl });
    }
  });
};
chrome.management.onEnabled.addListener(() => {
  reloadPatreon('https://www.readeon.com');
  // Notify the website when the extension is enabled
});
chrome.management.onDisabled.addListener(() => {
  reloadPatreon('https://www.readeon.com');
});
console.log('background loaded');
