/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import config from '@src/route.config';
import matcherStorage from '@src/shared/storages/matcherStorage';

class RouteMatcher {
  config: any;
  constructor() {
    this.config = config;
  }

  async getCurrentTabUrl() {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab ? tab.url : null;
  }

  async matchCurrentRoute(tabUrl?: string) {
    const url = tabUrl ?? (await this.getCurrentTabUrl());
    if (!url) return;

    const urlObj = new URL(url);
    const currentRoute = urlObj.href;
    const matchedRoute = this.config.routes.find(route => {
      return currentRoute.search(new RegExp(route['matchPattern'])) !== -1;
    });

    if (matchedRoute) {
      await matcherStorage.match(matchedRoute['name']);
    }

    return matchedRoute;
  }
}

export default RouteMatcher;
