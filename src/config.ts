/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
export interface Config {
  pages: {
    recentPageRoute: string;
    post: {
      commentsSelector: string;
      scrollToCommentsCondition: {
        queryParameter: string;
      };
      commentPost: string;
    };
    posts: {
      emptyCardSelector: string;
      creatorPublicPage: string;
      subscriptionNodeSelector: string;
      attachmentSelector: string;
      upgradeSelector: string;
      restoreAttachments: string;
      commentsSelector: string;
      postDetailsSelector: string;
      restoreCommentsSelector: string;
      pollSelector: string;
      restorePoll: string;
      audioSelector: string;
      linkSelector: string;
      restoreLinkSelector: string;
      showCommentSelector: string;
      restorePostDetailsSelector: string;
      restoreAudioSelector: string;
      showMoreSelector: string;
      postTitleSelector: string;
      restoreUpgradeSelector: string;
      singlePostAuthorKey: string;
      singlePostSelector: string;
      relatedPostSelector: string;
      relatedPostText: string;
      videoSelector: string;
      embedVideoSelector: string;
      restoreVideoSelector: string;
      videoTagSelector: string;
      overlayRootSelector: string;
      readeonPostContainer: string;
    };
    recentPosts: {
      recentLatestSelector: string;
      rootSelector: string;
      attachmentSelector: string;
      rootAuthorSelector: string;
      authorKeySelector: string;
      postSelector: string;
      showCommentSelector: string;
      restoreCommentsSelector: string;
      pollSelector: string;
      restorePoll: string;
      restorePostDetailsSelector: string;
      postDetailsSelector: string;
      commentsSelector: string;
      authorSelector: string;
      joinBthSelector: string;
      showMoreSelector: string;
      postTitleSelector: string;
      linkSelector: string;
      restoreLinkSelector: string;
    };
    sideBarNavElementSelector: string;
    sideBarSelector: string;
    creatorSelector: string;
  };
  misc: {
    showOnlyChapters: {
      regex: RegExp;
    };
  };
  ApiRoutes: {
    authorPostsRoute: string;
    featurePostsRoute: string;
    recentPagePostsRoute: string;
  };
}
export default {
  pages: {
    recentPageRoute: '/home',
    posts: {
      creatorPublicPage: '[data-tag="creator-public-page-recent-posts"]',
      attachmentSelector: '[data-tag="post-attachments"] #track-click',
      restoreAttachments: '[data-tag="post-attachments"]',
      commentsSelector: '[data-tag="content-card-comment-thread-container"]',
      postDetailsSelector: '[data-tag="post-details"]',
      restoreCommentsSelector: '[elevation="subtle"] > div > div:last-child > div',
      restorePostDetailsSelector: '[elevation="subtle"] > div > div:last-child > div',
      audioSelector: '[elevation="subtle"] > div > div',
      pollSelector: '[elevation="subtle"] > div > div > div > div:nth-child(2)',
      restorePoll: '[elevation="subtle"] > div > div > div > div',
      showCommentSelector: '[data-tag="comment-post-icon"]',
      restoreAudioSelector: '[elevation="subtle"] > div',
      upgradeSelector: '[data-tag="join-button"]',
      restoreUpgradeSelector: '[width="fluid"]',
      subscriptionNodeSelector: 'div[data-tag="free-membership-upgrade-cta"]',
      singlePostAuthorKey: '[span="2"] a[href]',
      relatedPostSelector: '[span="2"] h3',
      relatedPostText: 'Related posts',
      singlePostSelector: '[span="2"] div[data-tag="post-card"]',
      videoSelector: '[elevation="subtle"] > div > div > div',
      restoreVideoSelector: '[elevation="subtle"] > div > div',
      linkSelector: '[elevation="subtle"] > div > div > a',
      restoreLinkSelector: '[elevation="subtle"] > div > div',
      videoTagSelector: '[webkit-playsinline]',
      embedVideoSelector: '[elevation="subtle"] [title="video thumbnail"]',
      overlayRootSelector: '__next',
      emptyCardSelector: '[data-tag="stream-empty-card"]',
      readeonPostContainer: '#readeon-post-list-container .post-selection-checkbox',
    },
    post: {
      commentsSelector: '[data-tag="comment-row"]',
      scrollToCommentsCondition: {
        queryParameter: 'scrollToComments',
      },
      commentPost: 'Post',
    },
    recentPosts: {
      rootSelector: '#renderPageContentWrapper',
      rootAuthorSelector: 'section',
      authorKeySelector: '[aria-label="Visit page"]',
      postSelector: '[data-tag="launcher-post-card"]',
      pollSelector: '[elevation="subtle"] > div > div > div .sc-srm5fa-0',
      restorePoll: '[elevation="subtle"] > div > div > div .eqGeMB',
      postDetailsSelector: '[data-tag="post-details"]',
      restoreCommentsSelector: '[elevation="subtle"] > div > div:last-child > div',
      restorePostDetailsSelector: '[elevation="subtle"] > div > div > div .dnLaHC > div',
      showCommentSelector: '[data-tag="comment-post-icon"]',
      commentsSelector: '[data-tag="content-card-comment-thread-container"]',
      recentLatestSelector: '#renderPageContentWrapper > section > div > div.sc-d7d20940-4.iGCkiG > div > h2',
      authorSelector: '[shape="square"]',
      joinBthSelector: '[data-tag="join-button"]',
      showMoreSelector: 'button[aria-controls]',
      postTitleSelector: '[data-tag="post-title"] > a',
      linkSelector: '[elevation="subtle"] > div  > a',
      restoreLinkSelector: '[elevation="subtle"] > div',
    },
    sideBarNavElementSelector: '[data-tag="navbar"] > nav > div',
    sideBarSelector: 'main-app-navigation',
    creatorSelector: '[aria-label="Create post"]',
  },
  misc: {
    showOnlyChapters: {
      //eslint-disable-next-line
      regex: /\b((chapter|chapters|ch(\s?:)|episode|epilogue|prologue|ch\.\s?\d+|ch\:\s?\d+)|\w+\s?\d+\s?:\s?.*)\b/i,
    },
  },
  ApiRoutes: {
    authorPostsRoute: '/posts?include=campaign',
    featurePostsRoute: '?include=featured_post',
    recentPagePostsRoute: '/launcher/cards?include=campaign',
  },
} as Config;
