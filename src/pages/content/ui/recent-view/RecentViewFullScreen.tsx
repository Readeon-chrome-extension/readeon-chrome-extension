/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { FC, useEffect, useState } from 'react';
import FullScreen from '@src/shared/components/full-screen/FullScreen';
import useStorage from '@src/shared/hooks/useStorage';
import recentPostsStorage from '@src/shared/storages/recent-posts/recentPostsStorage';
import selectedFromRecentPostsStorage from '@src/shared/storages/recent-posts/selectedFromRecentPostsStorage';
import { Post } from '@src/shared/storages/posts/postsStorage';
import visitedPostsStorage from '@root/src/shared/storages/visitedPostsStorage';
import { injectComments } from '@src/pages/content/ui/recent-view/RecentView';
import bookmarkPostsStorage from '@root/src/shared/storages/bookmarkPostStorage';
import { selectedAuthorRecentPost } from '@root/src/shared/components/full-screen/utils';
import config from '@root/src/config';
import isEnableStorage from '@root/src/shared/storages/isEnableStorage';
import isLatestPostStorage from '@root/src/shared/storages/isLatestPost';
import { Modal } from '@root/src/shared/components/modal/Modal';
import { tipsArray } from '@root/src/shared/utils/posts';
import postsIsLoadingStorage from '@root/src/shared/storages/posts/postsIsLoadingStorage';

const RecentViewFullScreen: FC = () => {
  const recentPosts = useStorage(recentPostsStorage);
  const isLatestPost = useStorage(isLatestPostStorage);
  const selectedChapterId = useStorage(selectedFromRecentPostsStorage);
  const visitedPosts = useStorage(visitedPostsStorage);
  const isLoading = useStorage(postsIsLoadingStorage);
  const [selectedChapter, setSelectedChapter] = useState<Post | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [showActionItem, setShowActionItem] = useState<boolean>(true);
  const [openTipModal, setOpenTipModal] = useState<boolean>(false);
  const buttonClick = 0;
  const [loadingTip, setLoadingTip] = useState<string>();
  const [loadingTipIndex, setLoadingTipIndex] = useState<number>(0);
  const startTime = Date.now();
  const showTipContent = () => {
    if (loadingTipIndex <= tipsArray?.length - 1) {
      setLoadingTip(tipsArray[loadingTipIndex]);
      loadingTipIndex === tipsArray?.length - 1 ? setLoadingTipIndex(0) : setLoadingTipIndex(prev => prev + 1);
    }
  };
  useEffect(() => {
    if (isLoading) {
      showTipContent();
    }
  }, [isLoading]);
  useEffect(() => {
    if (selectedChapterId && !openModal) {
      setOpenModal(true);
    }
    if (recentPosts?.length && selectedChapterId) {
      const currentIndex = recentPosts?.findIndex(post => post?.id === selectedChapterId);
      const post = recentPosts?.[currentIndex];
      isValidAuthor(post?.authorKey);
      injectComments(post?.authorKey, post?.index, post);
    }
  }, [selectedChapterId]);
  const handleMessageEvent = event => {
    if (event?.data?.type === 'open-tip-modal') {
      if (buttonClick >= 2 && Date.now() - startTime > 5000) {
        setOpenTipModal(true);
      }
    }
  };
  useEffect(() => {
    window?.addEventListener('message', handleMessageEvent);
    return () => {
      window?.removeEventListener('message', handleMessageEvent);
    };
  }, [window]);
  useEffect(() => {
    const getPost = (id: number) => recentPosts.find(post => post.id === id) || null;
    if (selectedChapterId && recentPosts?.length) {
      setSelectedChapter(getPost(selectedChapterId));
      const post = getPost(selectedChapterId);
      bookmarkPostsStorage.add(post?.authorKeyLowerCase, { ...post, isBookMarkView: false }).then();
      if (!visitedPosts.includes(selectedChapterId)) {
        visitedPostsStorage.add(selectedChapterId).then();
      }
    } else {
      setSelectedChapter(null);
    }
  }, [recentPosts, selectedChapterId]);

  // if (!recentPosts.length) {
  //   return null;
  // }

  const isValidAuthor = (authorKey: string) => {
    const authorsNode = selectedAuthorRecentPost(authorKey);
    setShowActionItem(!!authorsNode?.length);
  };

  const handleChapterClick = async (id: number) => {
    if (!openModal) {
      setOpenModal(true);
    }
    await selectedFromRecentPostsStorage.set(id);
  };
  const handleNext = async () => {
    const nextChapterIndex = recentPosts.findIndex(post => post.id === selectedChapterId) + 1;
    const post = recentPosts[nextChapterIndex];
    isValidAuthor(post?.authorKey);

    if (!visitedPosts.includes(post?.id)) {
      await visitedPostsStorage.add(post?.id);
    }

    await handleChapterClick(recentPosts[nextChapterIndex].id);
    const isLastItem = nextChapterIndex === recentPosts?.length - 1;
    if (isLastItem) {
      checkLastPost(post?.authorKey, post?.index, isLastItem, post);
    }
  };
  const handlePrevious = async () => {
    const previousChapterIndex = recentPosts.findIndex(post => post.id === selectedChapterId) - 1;
    const post = recentPosts[previousChapterIndex];
    isValidAuthor(post?.authorKey);

    if (!visitedPosts.includes(post?.id)) {
      await visitedPostsStorage.add(post?.id);
    }

    await handleChapterClick(recentPosts[previousChapterIndex].id);
  };
  const handleClearSelectedChapter = async () => {
    setOpenModal(false);
    setShowActionItem(true);
    await isLatestPostStorage.add(false);
    await selectedFromRecentPostsStorage.clear();
  };
  const handleTipModalOk = async () => {
    window?.location?.reload();
  };
  return (
    <>
      {openModal && (
        <FullScreen
          showBookMarkIcon={false}
          isRecentView={true}
          isOpen={openModal}
          showComments={true}
          postData={selectedChapter}
          allowNext={selectedChapterId !== recentPosts?.[recentPosts?.length - 1]?.id}
          allowPrevious={selectedChapterId !== recentPosts?.[0]?.id}
          showNavigation={true}
          onClose={handleClearSelectedChapter}
          onNext={handleNext}
          onPrevious={handlePrevious}
          showActionItem={showActionItem}
          isLatestPost={isLatestPost}
          navigationTooltip="Navigation is not Supported for Latest Component"
          loadingTip={loadingTip}
        />
      )}
      {openTipModal && (
        <Modal
          isOpen={openTipModal}
          title="Tip"
          onClose={() => setOpenTipModal(false)}
          closeIcon
          footer={false}
          body={
            <div style={{ textAlign: 'center' }}>
              <p>Try refreshing the page if a Readeon feature is not working</p>
              <button
                className="bookmark_modal_button"
                style={{ textAlign: 'center', marginTop: '12px' }}
                onClick={handleTipModalOk}>
                Click To Refresh
              </button>
            </div>
          }
        />
      )}
    </>
  );
};

export default RecentViewFullScreen;

const checkLastPost = async (authorKey: string, postIndex: number, isLastItem: boolean, post: Post) => {
  const isChapterViewOff = await isEnableStorage.get();
  const authorPost = selectedAuthorRecentPost(authorKey);
  if (authorPost?.length > 0) {
    const element = authorPost[postIndex];
    if (!element) return;
    if (isLastItem) {
      //* this is for adding the new element below to each post so that we can scroll to the particular view
      const parentElement = element?.querySelector(config.pages.posts.restoreAudioSelector);
      const newDivElement = document?.createElement('div');
      newDivElement.classList.add('recent-view-post-scroll-view');
      parentElement.appendChild(newDivElement);

      if (isChapterViewOff) {
        const lastPostTitle = document?.querySelector(`#chapter-${post?.id}`);
        lastPostTitle?.scrollIntoView({ behavior: 'smooth' });
      } else {
        if (newDivElement) {
          newDivElement.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            newDivElement.remove();
          }, 2000);
        }
      }
    }
  } else if (isLastItem) {
    //Added this for those authors don't have valid author key for mapping eg:- Robert Blaise
    const invalidAuthorPostTitle = document.querySelector(`a[href="${post?.url}"]`);
    const invalidAuthorJoinBtn = document.querySelector(
      `a[href="${post?.upgrade_url}&redirect_uri=${encodeURIComponent(post?.url)}"]`,
    );

    post?.isView
      ? invalidAuthorPostTitle?.scrollIntoView({ behavior: 'smooth' })
      : invalidAuthorJoinBtn?.scrollIntoView({ behavior: 'smooth' });
  }
};
