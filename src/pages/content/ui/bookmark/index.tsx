/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { Modal } from '@root/src/shared/components/modal/Modal';
import FullScreen from '@root/src/shared/components/full-screen/FullScreen';
import useStorage from '@root/src/shared/hooks/useStorage';
import bookmarkPostsStorage from '@root/src/shared/storages/bookmarkPostStorage';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import postsStorage, { Post } from '@root/src/shared/storages/posts/postsStorage';
import { getKey, getPostKeyByUrl } from '@root/src/shared/utils/posts';
import React, { useMemo } from 'react';
import isBookMarkViewStorage from '@root/src/shared/storages/isBookmarkView';
import authorKeyStorage from '@root/src/shared/storages/recent-posts/authorKeyStorage';
import selectedFromRecentPostsStorage from '@root/src/shared/storages/recent-posts/selectedFromRecentPostsStorage';
import config from '@root/src/config';
import selectedPostAuthorStorage from '@root/src/shared/storages/posts/selectedPostAuthorStorage';

export const capitalizeFirstChar = str => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const BookmarkComponent = () => {
  const bookmarkedPosts = useStorage(bookmarkPostsStorage);
  const allPosts = useStorage(postsStorage);
  const bookmark = useStorage(isBookMarkViewStorage);
  const matcher = useStorage(matcherStorage);
  const authorKeyFromStorage = useStorage(authorKeyStorage);
  const key = matcher === 'creatorPost' ? getKey(window?.location?.href) : getPostKeyByUrl(window?.location?.href);
  const [authorKey, setAuthorKey] = React.useState<string | null>(key?.toLowerCase() ?? null);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = React.useState<boolean>(false);
  const [showActionItem, setShowActionItems] = React.useState<boolean>(true);
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = React.useState<boolean>(false);

  const storedPost = useMemo(() => {
    const post = bookmarkedPosts && authorKey ? bookmarkedPosts[authorKey] : null;
    return post;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkedPosts, authorKey]);

  React.useEffect(() => {
    const loadBookmarkedPost = async () => {
      const isCreator = document.querySelector(config.pages.creatorSelector);
      if (!isCreator && storedPost && storedPost?.authorKeyLowerCase?.toLowerCase() === authorKey) {
        if (storedPost.isGoToPostClicked) {
          setIsBookmarkModalOpen(true);
        }
        if (!storedPost?.isBookMarkView) {
          setIsBookmarkModalOpen(true);
        }
      }
    };
    loadBookmarkedPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmark]);

  React.useEffect(() => {
    const isCreator = document.querySelector(config.pages.creatorSelector);
    if (
      isCreator &&
      storedPost &&
      storedPost?.isCreatorView &&
      storedPost?.authorKeyLowerCase === authorKey &&
      !storedPost?.isBookMarkView
    ) {
      setIsBookmarkModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmark]);

  React.useEffect(() => {
    if (matcher === 'recentPosts' && authorKeyFromStorage) {
      setAuthorKey(authorKeyFromStorage);
      setIsBookmarkModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorKeyFromStorage]);

  const handleCloseModal = async (setState: (value: boolean) => void) => {
    setState(false);
    setShowActionItems(true);
  };

  const isRecentView = useMemo(() => {
    return window?.location?.pathname === '/home';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window]);

  const post = isBookmarkModalOpen && authorKey ? bookmarkedPosts[authorKey] : ({} as Post);

  return (
    <>
      {isBookmarkModalOpen && (
        <Modal
          title="Last Post Read"
          isOpen={isBookmarkModalOpen}
          body={
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px' }}>
                <span style={{ fontWeight: 'lighter' }}>{post?.title}</span>
              </p>
              {!post?.authorKey?.includes('https://') && (
                <p style={{ fontSize: '15px' }}>by {capitalizeFirstChar(post?.user?.attributes?.name)}</p>
              )}
            </div>
          }
          onClose={() => {
            bookmarkPostsStorage.add(authorKey, {
              ...storedPost,
              isBookMarkView: true,
              isCreatorView: false,
              isGoToPostClicked: false,
            });
            authorKeyStorage.clear();
            setIsBookmarkModalOpen(false);
            const bookMarkModal = document.querySelectorAll('.ReactModalPortal');
            if (bookMarkModal?.length) {
              bookMarkModal?.forEach(el => el?.remove());
            }
          }}
          onOk={() => {
            const authorPost = allPosts[authorKey]?.posts;
            let postExist: Post;
            if (authorPost?.length) {
              postExist = authorPost?.find(item => item?.id === post?.id);
              setShowActionItems(!!postExist);
            }
            bookmarkPostsStorage.add(authorKey, {
              ...storedPost,
              isBookMarkView: true,
              isCreatorView: false,
              isGoToPostClicked: true,
            });
            authorKeyStorage.clear();
            setIsBookmarkModalOpen(false);
            const bookMarkModal = document.querySelectorAll('.ReactModalPortal');
            if (bookMarkModal?.length) {
              bookMarkModal?.forEach(el => el?.remove());
            }
            if (matcher === 'recentPosts') {
              selectedFromRecentPostsStorage.set(storedPost?.id as any).then();
            } else {
              postExist ? selectedPostAuthorStorage.set(storedPost?.id as any).then() : setIsFullScreenModalOpen(true);
            }
          }}
        />
      )}

      {isFullScreenModalOpen && (
        <FullScreen
          showActionItem={showActionItem}
          isRecentView={isRecentView}
          isOpen={isFullScreenModalOpen}
          postData={bookmarkedPosts[authorKey]}
          showNavigation={!showActionItem}
          isLatestPost={!showActionItem}
          navigationTooltip="Navigation is not supported for this post"
          showBookMarkIcon={!bookmarkedPosts}
          onClose={() => handleCloseModal(setIsFullScreenModalOpen)}
        />
      )}
    </>
  );
};

export default BookmarkComponent;
