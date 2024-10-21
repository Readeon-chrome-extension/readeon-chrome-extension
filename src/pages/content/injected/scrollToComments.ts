/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { createPostsAuthors } from '@root/src/pages/content/injected/module/author-view-posts';
import { createPostsRecent } from '@root/src/pages/content/injected/module/recent-view-posts';

import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/content/injected/scrollToComments');
(() => {
  window?.addEventListener('message', event => {
    if (event?.data?.type === 'author_Posts') {
      createPostsAuthors(event?.data?.posts, event?.data?.requestUrl);
    } else if (event?.data?.type === 'recentView_Posts') {
      createPostsRecent(event?.data?.posts);
    } else if (event.data.type === 'logout') {
      chrome.runtime.sendMessage({ action: 'logout' });
    } else if (event.data?.type === 'REFRESH_PATREON') {
      chrome.runtime.sendMessage({ action: 'REFRESH_PATREON' });
    }
  });
})();
