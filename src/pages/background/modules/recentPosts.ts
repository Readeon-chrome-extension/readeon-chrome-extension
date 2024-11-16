/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import postsIsLoadingStorage from '@root/src/shared/storages/posts/postsIsLoadingStorage';

class RecentPosts {
  handledRequests: Set<string> = new Set([]);
  constructor() {}

  init() {
    chrome.webRequest.onBeforeRequest.removeListener(this.handleBeforeRequestListener);
    chrome.webRequest.onBeforeRequest.addListener(
      this.handleBeforeRequestListener,
      { urls: ['https://www.patreon.com/api/launcher/cards*'] },
      ['requestBody'],
    );
  }

  handleBeforeRequestListener(details: any) {
    if (details.tabId === -1 || details.type === 'other') {
      return;
    }
    const { url, initiator, originUrl } = details;
    if (
      url.startsWith('https://www.patreon.com/api/launcher/cards?include=campaign') &&
      (initiator?.startsWith('https://www.patreon.com') || originUrl?.startsWith('https://www.patreon.com'))
    ) {
      postsIsLoadingStorage.setLoading(true).then();
    }
  }
}

export default RecentPosts;
