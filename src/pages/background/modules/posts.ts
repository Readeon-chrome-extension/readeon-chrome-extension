/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import postsIsLoadingStorage from '@src/shared/storages/posts/postsIsLoadingStorage';

class Posts {
  constructor() {}

  init() {
    postsIsLoadingStorage.setLoading(true).then();
    chrome.webRequest.onCompleted?.removeListener(this.handleWebRequestListener);
    chrome.webRequest.onBeforeRequest.removeListener(this.handleBeforeRequestListener);
    chrome.webRequest.onCompleted.addListener(
      this.handleWebRequestListener,
      { urls: ['https://www.patreon.com/api/posts*', 'https://www.patreon.com/api/campaigns*'] },
      ['responseHeaders'],
    );
    chrome.webRequest.onBeforeRequest.addListener(
      this.handleBeforeRequestListener,
      { urls: ['https://www.patreon.com/api/posts*'] },
      ['requestBody'],
    );
  }

  handleBeforeRequestListener(details: any) {
    if (details.tabId === -1 || details.type === 'other') {
      return; // If the request is not from a tab, exit the function
    }
    const { url, initiator, originUrl } = details;

    const isFeaturePostUrl =
      url.startsWith('https://www.patreon.com/api/campaigns') && url.includes('?include=featured_post');
    if (
      (url.startsWith('https://www.patreon.com/api/posts?include=campaign') || isFeaturePostUrl) &&
      (initiator?.startsWith('https://www.patreon.com') || originUrl?.startsWith('https://www.patreon.com'))
    ) {
      postsIsLoadingStorage.setLoading(true).then();
    }
  }

  async handleWebRequestListener(details: any): Promise<void> {
    if (details.tabId === -1 || details.type === 'other') {
      return; // If the request is not from a tab, exit the function
    }
    const { url, method, initiator, originUrl } = details;

    const isFeaturePostUrl =
      url.startsWith('https://www.patreon.com/api/campaigns') && url.includes('?include=featured_post');
    if (
      (url.startsWith('https://www.patreon.com/api/posts?include=campaign') || isFeaturePostUrl) &&
      (initiator?.startsWith('https://www.patreon.com') || originUrl?.startsWith('https://www.patreon.com'))
    ) {
      //Added the window reload to get the updated post details
      if (isFeaturePostUrl && (method === 'POST' || method === 'DELETE')) {
        await chrome.tabs.reload();
        return;
      }
    }
  }
}

export default Posts;
