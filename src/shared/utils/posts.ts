/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
export const getPostKeyByUrl = (url: string) => {
  // Match the URL part after "/c/" and before "/post"
  const urlParts = url?.match(/\/c\/([a-zA-Z0-9_-]+)\/post$/);
  return urlParts ? urlParts[1]?.toLowerCase() : url?.toLowerCase();
};
export const getKey = (url: string) => {
  // Remove query parameters and fragments
  const cleanedUrl = url?.split(/[?#]/)[0];

  // Extract the author key by ensuring we only match the part after patreon.com/
  const urlParts = cleanedUrl?.match(/patreon\.com\/(?:c\/)?([a-zA-Z0-9_-]+)/);

  // Return the matched author key in lowercase or the cleaned URL if nothing is matched
  return urlParts ? urlParts[1]?.toLowerCase() : url?.toLowerCase();
};
export const restrictedKeywords = [
  'home',
  'collections',
  'about',
  'membership',
  'shop',
  'recommendations',
  'chats',
  'explore',
  'notifications',
  'basics',
  'settings',
  'library',
  'insights',
  'members',
  'payouts',
  'moderation-hub',
  'autopilot',
  'messages',
  'promotions',
  'settings-creator',
  'account',
  'edit',
  'merch',
  'payments',
  'welcome',
  'offers',
  'drafts',
  'audio',
  'email',
  'payout',
];
export const tipsArray = [
  `Tip: For the best Readeon performance, wait a few seconds before loading more pages`,
  `Tip: Experiencing Readeon issues? Try refreshing your page or make use of the Readeon Overlay feature`,
  `Tip: Want to report a problem, give feedback, or learn more about using the extension? Click on the Open Readeon Controls button`,
  `Tip: Enjoying using Readeon? Consider leaving a review in the extension store!`,
  `Tip: Posts taking a while to load? It’s not Readeon that is slow, but Patreon’s post gathering mechanism.`,
  `Tip: Enjoying Readeon? Consider supporting me on Patreon by clicking on the Support Readeon button`,
];
