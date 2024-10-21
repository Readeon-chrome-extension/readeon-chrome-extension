/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
const getIntercepts = async () => {
  const { fetch: originFetch } = window;
  try {
    window.fetch = async (...args) => {
      const [resource, config] = args;

      const response = await originFetch(resource, config);
      const isFeaturePostUrl =
        response?.url?.startsWith('https://www.patreon.com/api/campaigns') &&
        response?.url?.includes('?include=featured_post');

      if (response?.url?.startsWith('https://www.patreon.com/api/posts?include=campaign') || isFeaturePostUrl) {
        const postData = await response?.clone()?.json();
        window.parent.postMessage({ type: 'author_Posts', posts: postData, requestUrl: response?.url });
      } else if (response?.url?.startsWith('https://www.patreon.com/api/launcher/cards?include=campaign')) {
        const postData = await response?.clone()?.json();
        window.parent.postMessage({ type: 'recentView_Posts', posts: postData, requestUrl: response?.url });
      }

      return response;
    };
  } catch (error) {
    console.log('error', error);
  }
};
getIntercepts();
