/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { createRoot } from 'react-dom/client';
import PostsView from '@src/pages/content/ui/posts-view/PostsView';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import config from '@src/config';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import extEnableStorage from '@root/src/shared/storages/extEnableStorage';
import BookmarkComponent from '@src/pages/content/ui/bookmark';
import { getKey } from '@root/src/shared/utils/posts';
import bookmarkPostsStorage from '@root/src/shared/storages/bookmarkPostStorage';
import postsStorage from '@root/src/shared/storages/posts/postsStorage';
import FeedbackPopUp from '@src/pages/content/ui/feedback';

import ReportPopUp from '@src/pages/content/ui/report';
import singlePostStorage from '@root/src/shared/storages/singlePostStorage';
import SinglePost from '@src/pages/content/ui/posts-view/SinglePost';
import dynamicSelectorStorage from '@root/src/shared/storages/configStorage';
import checkboxIdsStorage from '@root/src/shared/storages/checkboxStorage';
import pinnedPostStorage from '@root/src/shared/storages/pinnedPostStorage';
import OverlayCreator from '../overlay';
import { removeSubscriptionNode } from '@root/src/shared/components/full-screen/utils';
import { creatorPublicPage } from '../../dynamic/configSelector';

refreshOnUpdate('pages/content');
(async () => {
  const root = document.createElement('div');
  root.id = 'patreon-chrome-extension-readeon-view-root';
  root.style.width = '100%';
  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = 'patreon-chrome-extension-shadow-root';

  const stylesDiv = document.createElement('div');

  let targetElement: Element;
  let isMounted = false;
  let mountedSinglePost = false;
  let lastUrl = window.location.href;
  let lastUrlCheck = window.location.href;
  let overlayRootEleMounted = false;
  let readeonViewBtnMounted = false;

  const observer = new MutationObserver(async mutationsList => {
    // Look through all mutations that just occurred
    for (const mutation of mutationsList) {
      // If the addedNodes property has one or more nodes
      if (mutation.addedNodes.length) {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrlCheck) {
          lastUrlCheck = currentUrl;
          hindOverlayButton();
        }
        const dynamicConfig = await dynamicSelectorStorage.get();
        const matcher = await matcherStorage.get();
        if (!dynamicConfig?.postsSelector?.length) return;

        if (matcher === 'recentPosts') return;

        targetElement = document.querySelector(dynamicConfig.postsSelector);
        const targetElementSinglePost = document.querySelector(config.pages.recentPosts.rootSelector);
        const overlayTargetEle = document.getElementById(config.pages.posts.overlayRootSelector);
        if (targetElementSinglePost && !readeonViewBtnMounted) {
          readeonViewBtnInject(targetElementSinglePost);
          readeonViewBtnMounted = true;
        }
        // Adding the overlay feature selector

        if (overlayTargetEle && !overlayRootEleMounted) {
          overlayRootMount(overlayTargetEle);
          overlayRootEleMounted = true;
        }

        if (targetElementSinglePost && !mountedSinglePost) {
          mountedSinglePost = true;
          mountSinglePostView(targetElementSinglePost);
        }

        if (!targetElement) {
          lastUrl = window.location.href;
          return;
        }

        if ((lastUrl && lastUrl !== window.location.href) || !isMounted) {
          isMounted = true;
          mountReactView();
        }

        lastUrl = window.location.href;
      }
    }
  });
  const hindOverlayButton = () => {
    const button = document.getElementById('readeon-overlay-open-btn');
    if (!button) return;

    if (isRestrictedPageHandle()) {
      button.style.display = 'none';
    } else {
      button.style.display = 'inline-flex';
    }
  };

  const isRestrictedPageHandle = () => {
    const restrictedKeywords = ['home', 'collections', 'about', 'membership', 'shop', 'recommendations', 'chats'];
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const lastPart = pathParts[pathParts.length - 1].toLowerCase();
    return restrictedKeywords.includes(lastPart);
  };
  const trackElement = (
    targetElementSinglePost: Element,
    callback: (ele: Element) => void,
    interval = 1000,
    timeout = 11000,
  ) => {
    const intervalId = setInterval(() => {
      const element = targetElementSinglePost?.querySelector(config.pages.posts.relatedPostSelector);
      if (element) {
        callback(element);
        clearInterval(intervalId); // Stop checking when element is found
      }
    }, interval);

    // Stop tracking after the specified timeout
    setTimeout(() => {
      clearInterval(intervalId);
    }, timeout);
  };

  const mountSinglePostView = async (targetElementSinglePost: Element) => {
    const singlePost = await singlePostStorage.get();
    const pathname = window.location.pathname;
    if (singlePost?.href === pathname && singlePost?.isSinglePostView && targetElementSinglePost) {
      const extEnable = await extEnableStorage.get();

      if (!extEnable) {
        return;
      }

      const rootExist = document.getElementById('patreon-chrome-extension-view-root-full-screen');
      if (rootExist) rootExist?.remove();

      const root = document.createElement('div');
      root.id = `patreon-chrome-extension-view-root-full-screen`;

      targetElementSinglePost?.insertAdjacentElement('afterend', root);

      trackElement(
        targetElementSinglePost, // Selector for the element to track
        element => {
          if (element?.textContent === config.pages.posts.relatedPostText) {
            const isExist = document.getElementById('single-post-warning-container');
            if (isExist) isExist.remove();

            const warningEle = ` <div
            id="single-post-warning-container"
            style="
              border: var(--global-borderWidth-thin) solid var(--global-border-action-default);
              border-radius: 'var(--global-radius-md)';
              padding: 16px;
              text-align: center;
              color: #FF7F3E;
              width:94%;
              font-size:14px;
            ">
            Readeon does not support Related Posts.
          </div>`;
            element?.insertAdjacentHTML('beforeend', warningEle);
          }
        },
      );
      const authorKeyEle = targetElementSinglePost.querySelector(
        config.pages.posts.singlePostAuthorKey,
      ) as HTMLAnchorElement;
      const key = getKey(authorKeyEle?.href ?? '');

      const rootIntoShadow = document.createElement('div');
      rootIntoShadow.id = 'shadow-root';

      root?.appendChild(rootIntoShadow);

      const stylesDiv = document.createElement('div');
      root?.appendChild(stylesDiv);

      try {
        createRoot(rootIntoShadow).render(
          <>
            <SinglePost authorKey={key?.toLowerCase()} targetElement={targetElementSinglePost as Element} />
            <FeedbackPopUp />
            <ReportPopUp />
          </>,
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      const singlePostEle = targetElementSinglePost?.querySelector('[data-tag="creator-header"] a');
      const element = targetElementSinglePost?.querySelector('[span="2"]');
      if (element && singlePostEle) {
        const warningEle = ` <div
            style="
              border: var(--global-borderWidth-thin) solid var(--global-border-action-default);
              border-radius: 'var(--global-radius-md)';
              padding: 16px;
              text-align: center;
              color: #FF7F3E;
              width:94%;
              margin-bottom:12px;
              font-size:14px;
            ">
           To use Readeon's features  go to the creator's page and find this post there.
          </div>`;
        element?.insertAdjacentHTML('afterbegin', warningEle);
      }
    }
  };
  observer.observe(document?.body, { childList: true, subtree: true });

  async function mountReactView() {
    const creatorPublicPage = document.querySelector(config.pages.posts.creatorPublicPage);

    const inputSearch = document.getElementById('search-posts');

    if (inputSearch) {
      inputSearch.setAttribute('placeholder', 'Search for a story or posts');

      // Apply inline styles for the input element
      inputSearch.style.whiteSpace = 'nowrap';
      inputSearch.style.overflow = 'hidden';
      inputSearch.style.textOverflow = 'ellipsis';
    }

    const extEnable = await extEnableStorage.get();
    if (!extEnable) {
      return;
    }
    const bookMarkModal = document.querySelectorAll('.ReactModalPortal');

    if (bookMarkModal?.length) {
      bookMarkModal?.forEach(ele => ele?.remove());
    }

    if (creatorPublicPage) {
      root.style.marginTop = '8px';
      targetElement?.insertAdjacentElement('beforebegin', root);
      targetElement?.setAttribute('style', 'display: none');
      removeSubscriptionNode();
      targetElement?.nextElementSibling.setAttribute('style', 'display:none');
    } else {
      if (targetElement?.parentElement && !targetElement?.parentElement?.parentElement?.contains(root)) {
        targetElement?.parentElement?.insertAdjacentElement('beforebegin', root);
        console.log('targetElement', { targetElement });

        // Hide the original element
        removeSubscriptionNode();
        targetElement?.parentElement?.setAttribute('style', 'display: none');
      }
    }

    if (!rootIntoShadow.innerHTML) {
      root.appendChild(rootIntoShadow);
      root.appendChild(stylesDiv);
    }

    /**
     *
     * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
     */
    try {
      createRoot(rootIntoShadow).render(
        <>
          <PostsView isView="Post" />
          <BookmarkComponent />
        </>,
      );
    } catch (error) {
      console.error(error);
    }
  }
  const injectButtonListener = () => {
    const readeonControl = document.getElementById('open-readeon-control');
    const readeonSupport = document.getElementById('support-readeon-control');
    if (!readeonControl) {
      setTimeout(() => injectButtonListener(), 500);
      return;
    }

    readeonControl?.addEventListener('click', async () => {
      chrome.runtime.sendMessage({ action: 'Open_PopUp' });
    });
    readeonSupport.addEventListener('click', () => {
      window.open('https://www.patreon.com/DemocraticDeveloper', '_self');
    });
  };

  const reportIssuePatreon = async () => {
    const extEnabled = await extEnableStorage?.get();
    const navElement = document?.querySelector(config.pages.sideBarNavElementSelector) as HTMLElement;
    const sidebarEle = document.getElementById(config.pages.sideBarSelector);

    if (navElement && extEnabled) {
      navElement.style.flexDirection = 'column';
      navElement.style.gap = '12px';
    }
    sidebarEle.style.zIndex = '1195';

    const injectButton = `<div id="report-issue-container" style="display:flex;flex-direction:column;gap:8px;"><button class="bookmark_modal_button" id="open-readeon-control" style='padding:0;width:190px;font-size:12px;'>Open Readeon Controls</button>
    <button class="bookmark_modal_button" id="support-readeon-control" style='padding:0;width:190px;font-size:12px;'>Support Readeon</button>
    </div>`;

    if (extEnabled) navElement?.insertAdjacentHTML('beforeend', injectButton);
    const sidebarElement = document?.getElementById('main-app-navigation');
    const sideReadeonButtons = document?.getElementById('report-issue-container') as HTMLElement;
    if (sidebarElement?.clientWidth < 248) {
      sideReadeonButtons.style.display = 'none';
    }
  };

  window?.addEventListener('resize', () => {
    const sideBarElement = document.getElementById('report-issue-container') as HTMLElement;
    const size = window.innerWidth;
    if (sideBarElement) {
      if (size < 978) {
        sideBarElement.style.display = 'none';
      } else if (size >= 978) {
        sideBarElement.style.display = 'flex';
      }
    }
  });
  reportIssuePatreon();
  //* this function runs one time and inject the buttons into the sidebar
  injectButtonListener();

  const overlayRootMount = async (overlayRootElement: Element) => {
    const extEnable = await extEnableStorage.get();

    if (!extEnable) {
      return;
    }

    const overlayRoot = document.createElement('div');
    overlayRootElement.insertAdjacentElement('beforeend', overlayRoot);

    const overlayRootIntoShadow = document.createElement('div');
    overlayRootIntoShadow.id = 'overlay-shadow-root';

    overlayRoot.id = `patreon-chrome-extension-creator-overlay`;

    const styleDiv = document.createElement('div');
    overlayRoot.appendChild(overlayRootIntoShadow);
    overlayRoot.appendChild(styleDiv);
    try {
      createRoot(overlayRootIntoShadow).render(
        <>
          <OverlayCreator />
          <FeedbackPopUp />
          <ReportPopUp />
        </>,
      );
    } catch (error) {
      console.error(error);
    }
  };
  const readeonViewBtnInject = async (targetElement: Element, startTime: number = Date.now()) => {
    const dynamicConfig = await dynamicSelectorStorage.get();
    const extEnabled = await extEnableStorage?.get();
    const isExistBtn = document.getElementById('readeon-overlay-open-btn');
    if (!extEnabled || isExistBtn) return;

    const creatorName = targetElement.querySelector(dynamicConfig?.creatorNameSelector);

    if (Date.now() - startTime > 5000) {
      return;
    }
    if (!creatorName) {
      setTimeout(() => readeonViewBtnInject(targetElement, startTime), 300);
      return;
    }

    const isCreatorPublicPage = document.querySelector(creatorPublicPage);
    if (creatorName?.parentElement && !window.location.pathname.includes('messages')) {
      !isCreatorPublicPage &&
        creatorName?.parentElement?.setAttribute('style', 'flex-direction: column;align-items:center;display:flex');
      const btn = `<button class="bookmark_modal_button" id="readeon-overlay-open-btn" style="padding:0;width:190px;font-size:14px;margin-top:12px;font-weight:700;min-height:40px;max-height:40px;${isRestrictedPageHandle() ? 'display:none' : 'display:inline-flex'}">Open Readeon Overlay</button>`;
      creatorName?.parentElement?.insertAdjacentHTML('beforeend', btn);
      const overlayBtn = document.getElementById('readeon-overlay-open-btn');
      if (overlayBtn) {
        overlayBtn?.addEventListener('click', () => {
          window.parent.postMessage({ type: 'Open_Readeon_Overlay' });
        });
      }
    }
  };
})();

export const savePostClickOnTitle = async (id: string | number, element: Element, authorKey: string) => {
  //click event on title

  element.addEventListener('click', async ev => {
    const targetEle = ev.target as Element;
    const pinned = targetEle?.getAttribute('data-set-pinned');
    const postsData: any = pinned === 'true' ? await pinnedPostStorage.get() : await postsStorage.get();
    const authorSpecific = pinned === 'true' ? postsData[authorKey] : postsData[authorKey]?.posts;

    const targetUrl = targetEle.getAttribute('href');

    const targetId = getPostId(targetUrl);
    if (id === targetId) {
      const post = authorSpecific?.find(post => String(post.id) === targetId);
      if (post) {
        await singlePostStorage.add(targetUrl, true, false, true);
        await bookmarkPostsStorage.add(authorKey, { ...post, isBookMarkView: false });
      }
    } else {
      await singlePostStorage.add(targetUrl, true, false, false);
    }
  });
};
export const createButton = (index: number) => {
  const buttonEle = document.createElement('button');
  buttonEle.innerHTML = 'Full Screen';
  buttonEle.style.width = '120px';

  buttonEle.style.padding = '0px';
  buttonEle.className = 'bookmark_modal_button';
  buttonEle.style.marginLeft = '5px';
  buttonEle.id = `full-screen-button-${index}`;
  return buttonEle;
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
export const createCheckboxButton = (
  titleElement: HTMLElement,
  index: number | string,
  url: string,
  storedIds: string[],
  authorKey: string,
) => {
  if (!titleElement) return;

  if (url) {
    const checkboxContainer = document?.createElement('div');
    checkboxContainer.style.display = 'flex';
    const postId = getPostId(url);
    const checkbox = checkboxButton(postId);

    const isExist = titleElement?.querySelector(`input#checkbox-${postId}`);

    if (isExist) return;

    //* Check if the post ID exists in the retrieved list and set checkbox to checked
    checkboxContainer.appendChild(checkbox);
    if (storedIds.includes(postId)) {
      checkbox.checked = true;
    }
    titleElement.insertAdjacentElement('afterbegin', checkboxContainer);

    //* Add event listener to the checkbox
    checkbox.addEventListener('change', async e => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        // Save ID in storage
        await checkboxIdsStorage.addPostId(authorKey, postId);
      } else {
        // Remove the same saved ID from the storage
        await checkboxIdsStorage.removePostId(authorKey, postId);
      }
    });
  } else {
    const checkbox = checkboxButton(index, true);
    const isExist = titleElement?.querySelector(`input#checkbox-${index}`);

    if (isExist) return;

    const spanTag = document.createElement('span');
    spanTag.innerHTML = 'This post is locked and cannot be downloaded';
    spanTag.className = 'tooltip-text';
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.cursor = 'default';
    checkboxContainer.id = `checkbox-container-${index}`;
    checkboxContainer.classList.add('tooltip-container', 'checkbox-selection-tooltip');
    checkboxContainer.style.display = 'flex';
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(spanTag);
    titleElement.insertBefore(checkboxContainer, titleElement.firstChild);
  }
};
export const checkboxButton = (id: number | string, disabled = false) => {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `checkbox-${id}`;
  checkbox.setAttribute('data-set-id', String(id));
  checkbox.classList.add('post-selection-checkbox');
  checkbox.style.width = '18px';
  checkbox.style.height = '18px';
  checkbox.style.cursor = 'pointer';
  if (disabled) {
    checkbox.disabled = true;
    checkbox.style.opacity = '0.6';
    checkbox.style.cursor = 'default';
  }
  return checkbox;
};
//* this below code will be responsible for rendering the checkboxes on each post
export const styleTitleElement = (titleElement: HTMLElement) => {
  titleElement?.setAttribute('style', 'display:flex;width:100%;gap:6px;align-items:center;');
};
