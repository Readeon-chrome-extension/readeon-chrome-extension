/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import config from '@src/config';
import { createRoot } from 'react-dom/client';
import RecentView from '@pages/content/ui/recent-view/RecentView';
import RecentViewFullScreen from '@pages/content/ui/recent-view/RecentViewFullScreen';
import extEnableStorage from '@root/src/shared/storages/extEnableStorage';
import selectedFromRecentPostsStorage from '@root/src/shared/storages/recent-posts/selectedFromRecentPostsStorage';
import bookmarkPostsStorage from '@root/src/shared/storages/bookmarkPostStorage';
import postsStorage, { Post } from '@root/src/shared/storages/posts/postsStorage';
import recentPostsStorage from '@root/src/shared/storages/recent-posts/recentPostsStorage';
import BookmarkComponent from '../bookmark';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import { getKey } from '@root/src/shared/utils/posts';
import ReportPopUp from '../report';
import singlePostStorage from '@root/src/shared/storages/singlePostStorage';
import isLatestPostStorage from '@root/src/shared/storages/isLatestPost';
import FeedbackPopUp from '../feedback';

refreshOnUpdate('pages/content');

(async () => {
  const mountedRoots = new Map();
  let isFullScreenMounted = false;
  let isLatestInjected = false;

  let rootSelector = document.querySelector(config.pages.recentPosts.rootSelector);

  const observer = new MutationObserver(async mutationsList => {
    // Look through all mutations that just occurred
    for (const mutation of mutationsList) {
      const matcher = await matcherStorage.get();
      // If the addedNodes property has one or more nodes
      if (mutation.addedNodes.length) {
        if (!rootSelector) return;

        //checking the valid route to run the script
        if (matcher !== 'recentPosts') return;

        rootSelector = document.querySelector(config.pages.recentPosts.rootSelector);
        const elements = rootSelector.querySelectorAll(config.pages.recentPosts.authorKeySelector);
        const rootForFullScreen = document.querySelector(config.pages.recentPosts.rootSelector);

        const latest = document.querySelector(config.pages.recentPosts.recentLatestSelector);

        if (latest && latest?.textContent === 'Latest' && !isLatestInjected) {
          mountLatestPost(latest);
          isLatestInjected = true;
        }
        [...elements].forEach(targetElement => {
          if (targetElement && !mountedRoots.has(targetElement)) {
            setTimeout(() => {
              mountRecentPageView(targetElement as HTMLElement);
            }, 500);

            mountedRoots.set(targetElement, true);
          }
        });

        if (rootForFullScreen && !isFullScreenMounted) {
          mountFullScreenView();
          isFullScreenMounted = true;
        }
      }
    }
  });

  window.addEventListener('historyChange', () => {
    mountedRoots.forEach((_, targetElement) => {
      if (targetElement) unmountRecentPageView(targetElement);
    });
    unmountFullScreenView();
    mountedRoots.clear();
    isFullScreenMounted = false;
  });

  observer.observe(document?.body, { childList: true, subtree: true });

  async function mountRecentPageView(targetElement: HTMLElement) {
    const extEnable = await extEnableStorage.get();

    if (!extEnable) {
      return;
    }
    const root = document.createElement('div');
    root.style.width = '92%';

    targetElement?.parentElement.setAttribute('style', 'flex-direction: column;align-items: center;');
    targetElement.insertAdjacentElement('afterend', root);

    const rootAuthorElement = targetElement.closest(config.pages.recentPosts.rootAuthorSelector);
    const postElements = rootAuthorElement.querySelectorAll(config.pages.recentPosts.postSelector);
    const authorKey = rootAuthorElement.querySelector(config.pages.recentPosts.authorKeySelector).getAttribute('href');

    root.id = `patreon-chrome-extension-view-root-${authorKey}`;
    // Hide all posts from specific author
    [...postElements].forEach(element => {
      element.setAttribute('style', 'display: none');
      const title = element?.querySelector('[data-tag="post-title"]');
      //getting the post title to get the post id
      const url = title?.querySelector('a')?.getAttribute('href');

      const titleEle = element?.querySelector('[data-tag="post-title"] > a');
      url &&
        title &&
        savePostClickOnTitle(
          getPostId(url),
          titleEle,
          authorKey.startsWith('https://www.patreon.com/user')
            ? authorKey?.replace(/\/user/, '/user/posts')?.toLowerCase()
            : authorKey?.toLowerCase(), //Todo: this is now only works with this type of authors that has no author name
          'recent',
        );
    });

    const rootIntoShadow = document.createElement('div');
    rootIntoShadow.id = 'shadow-root';

    root.appendChild(rootIntoShadow);

    const stylesDiv = document.createElement('div');
    root.appendChild(stylesDiv);

    try {
      createRoot(rootIntoShadow).render(
        <>
          <RecentView
            authorKey={authorKey?.toLowerCase()}
            authorKeyCamelCase={authorKey}
            targetElement={targetElement}
          />
        </>,
      );
    } catch (error) {
      console.error(error);
    }
  }
  function unmountRecentPageView(targetElement: HTMLElement) {
    const authorKey = targetElement.getAttribute('href');
    if (!authorKey) return;
    const root = document.getElementById(`patreon-chrome-extension-view-root-${authorKey}`);
    if (root) {
      root.remove();
    }
  }

  async function mountFullScreenView() {
    const extEnable = await extEnableStorage.get();
    const matcher = await matcherStorage.get();
    if (!extEnable) {
      return;
    }
    const root = document.createElement('div');
    root.id = `patreon-chrome-extension-view-root-full-screen`;

    const targetElement = document.querySelector(config.pages.recentPosts.rootSelector);

    targetElement?.insertAdjacentElement('afterend', root);

    const rootIntoShadow = document.createElement('div');
    rootIntoShadow.id = 'shadow-root';

    // const shadowRoot = root.attachShadow({ mode: 'open' });
    root?.appendChild(rootIntoShadow);

    const stylesDiv = document.createElement('div');
    root?.appendChild(stylesDiv);

    try {
      createRoot(rootIntoShadow).render(
        <>
          <RecentViewFullScreen />
          {matcher === 'recentPosts' && (
            <>
              <BookmarkComponent />
              <FeedbackPopUp />
              <ReportPopUp />
            </>
          )}
        </>,
      );
    } catch (error) {
      console.error(error);
    }
  }

  function unmountFullScreenView() {
    const root = document.getElementById(`patreon-chrome-extension-view-root-full-screen`);
    if (root) {
      root.remove();
    }
  }

  const mountLatestPost = async (element: Element) => {
    const isExtensionEnable = await extEnableStorage.get();
    if (isExtensionEnable) {
      const warningEle = ` <div
                style="
                  border: var(--global-borderWidth-thin) solid var(--global-border-action-default);
                  border-radius: var(--global-radius-md);
                  padding: 16px;
                  text-align: center;
                  color: #FF7F3E;
                  width:100%;
                  font-size:14px;
                ">
                Readeon does not support "Readeon View” for this component.
              </div>`;
      element?.insertAdjacentHTML('beforeend', warningEle);
      const rootAuthorElement = element?.closest(config.pages.recentPosts.rootAuthorSelector);
      const postElements = rootAuthorElement.querySelectorAll(config.pages.recentPosts.postSelector);
      [...postElements]?.forEach((element: Element, index: number) => {
        const authorUrl = element.querySelector(config.pages.recentPosts.authorSelector).closest('a')?.href;
        const authorKey = authorUrl?.includes('https://www.patreon.com') && getKey(authorUrl ?? '');
        if (authorKey) {
          injectFullScreen(element, index, authorKey, true);
        }
      });
    }
  };
})();

const injectFullScreen = async (element: Element, index: number, authorKey: string, isLatestPost?: boolean) => {
  const buttonEle = document.createElement('button');
  buttonEle.innerHTML = 'Full Screen';
  buttonEle.style.width = '120px';

  buttonEle.className = 'bookmark_modal_button';
  buttonEle.style.padding = '0px';
  buttonEle.style.marginLeft = '5px';
  buttonEle.id = 'full-screen-button' + index;

  const title = element?.querySelector('[data-tag="post-title"]');
  //getting the post title to get the post id
  const url = title?.querySelector('a')?.getAttribute('href');

  if (title && url) {
    title?.setAttribute('style', 'display:flex;width:100%;justify-content:space-between;');
    const postId = getPostId(url);
    const titleEle = element?.querySelector('[data-tag="post-title"] > a');
    savePostClickOnTitle(postId, titleEle, authorKey?.toLowerCase(), 'recent');
    buttonEle?.setAttribute('data-set-id', postId);
    title?.parentElement?.appendChild(buttonEle);

    //adding the on click listener on the full screen button
    buttonEle.addEventListener('click', ev => {
      const targetEle = ev.target as Element;
      const parentEle = targetEle?.parentElement?.parentElement?.parentElement?.parentElement;
      const postTitle = parentEle?.querySelector('[data-tag="post-title"] > a') as HTMLAnchorElement;
      const showMore = parentEle.querySelector('.dvNIcM') as HTMLButtonElement;

      isLatestPost && isLatestPostStorage.add(isLatestPost).then();

      !showMore && setTimeout(() => postTitle?.focus(), 200);
      const postId = targetEle.getAttribute('data-set-id');
      if (postId && postId?.length) {
        selectedFromRecentPostsStorage.set(postId as any).then();
      } else {
        window?.postMessage({ type: 'open-tip-modal' }, '*');
      }
    });
  } else {
    const tooltipWrapper = document.createElement('div');

    const spanTag = document.createElement('span');
    spanTag.innerHTML = 'Full Screen Mode not Supported for Locked Posts';
    tooltipWrapper.id = `full-screen-button-wrapper-${index}`;
    tooltipWrapper.className = 'tooltip-container';

    spanTag.className = 'tooltip-text';
    buttonEle.style.opacity = '0.8';
    buttonEle.style.width = '100px';
    buttonEle.style.cursor = 'pointer';

    buttonEle?.setAttribute('disabled', 'true');
    const wrapper = title?.parentElement?.querySelector(`#full-screen-button-wrapper-${index}`);
    if (wrapper) wrapper.remove();

    tooltipWrapper.appendChild(buttonEle);
    tooltipWrapper.appendChild(spanTag);
    title?.parentElement?.appendChild(tooltipWrapper);
  }
};

export const getPostId = (inputString: string) => {
  // Use a regular expression to extract the number at the end of the string
  const match = inputString.match(/(\d+)$/);
  // Check if a match is found and extract the number
  if (match) {
    const extractedNumber = match[1];
    return extractedNumber;
  }
};
export const savePostClickOnTitle = async (
  id: string | number,
  element: Element,
  authorKey: string,
  viewType: 'author' | 'recent',
) => {
  //click event on title
  element.addEventListener('click', async ev => {
    //get all posts data and extract specific author's post
    const postsData = viewType === 'author' ? await postsStorage.get() : await recentPostsStorage.get();
    const authorSpecific: Post[] = viewType === 'author' ? postsData[authorKey]?.posts : postsData;
    const targetEle = ev.target as Element;
    const targetUrl = targetEle.getAttribute('href');

    const targetId = getPostId(targetUrl);

    if (id === targetId) {
      const post = authorSpecific.find(post => String(post.id) === targetId);
      if (post) {
        await singlePostStorage.add(targetUrl, true, false, true);
        bookmarkPostsStorage.add(authorKey?.toLowerCase(), { ...post, isBookMarkView: false });
      } else {
        await singlePostStorage.add(targetUrl, true, false, false);
      }
    }
  });
};
