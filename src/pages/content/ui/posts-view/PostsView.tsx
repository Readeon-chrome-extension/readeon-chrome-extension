/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import useStorage from '@src/shared/hooks/useStorage';
import postsStorage, { PostData } from '@src/shared/storages/posts/postsStorage';
import dayjs from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';
import FullScreen from '@src/shared/components/full-screen/FullScreen';
import visitedPostsStorage from '@src/shared/storages/visitedPostsStorage';
import { getKey, getPostKeyByUrl, tipsArray } from '@src/shared/utils/posts';
import { Pagination } from '@src/shared/components/pagination/Pagination';
import config from '@src/config';
import { TopButtons } from '@src/shared/components/top-buttons/TopButtons';
import isEnableStorage from '@src/shared/storages/isEnableStorage';
import postsIsLoadingStorage from '@src/shared/storages/posts/postsIsLoadingStorage';

import { PerChapter } from '@src/shared/components/per-chapter/PerChapter';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import PageSizeSelector from '@root/src/shared/components/select-component/select';
import styled from '@emotion/styled';
import bookmarkPostsStorage from '@root/src/shared/storages/bookmarkPostStorage';
import isBookMarkViewStorage from '@root/src/shared/storages/isBookmarkView';
import { Tooltip } from 'react-tooltip';
import pinnedPostStorage from '@root/src/shared/storages/pinnedPostStorage';
import isRequestHasFilterStorage from '@root/src/shared/storages/isRequesHasFilterStorage';
import dynamicSelectorStorage from '@root/src/shared/storages/configStorage';
import PostSelectionActionButton from '@root/src/shared/components/action-button';
import { removeSubscriptionNode } from '@root/src/shared/components/full-screen/utils';
import selectedPostAuthorStorage from '@root/src/shared/storages/posts/selectedPostAuthorStorage';
import currentPageStorage from '@root/src/shared/storages/posts/currentPage';
import pageSizeStorage from '@root/src/shared/storages/posts/pageSizeStorage';
dayjs.extend(relativeTime);
export type isViewType = 'Post' | 'Overlay' | 'Recent';
const toggleElements = async (isEnable: boolean, startTime: number = Date.now()) => {
  const dynamicConfig = await dynamicSelectorStorage.get();
  const postsElement = document.querySelector(dynamicConfig?.postsSelector) as HTMLElement;
  const emptyCard = document.querySelector(config.pages.posts.emptyCardSelector) as HTMLElement;
  const creatorPublicPage = document.querySelector(config.pages.posts.creatorPublicPage);

  // Check if 5 seconds have passed
  if (Date.now() - startTime > 5000) {
    return;
  }
  if (!postsElement && !emptyCard) {
    setTimeout(() => toggleElements(isEnable, startTime), 300);
    return;
  }

  if (!isEnable) {
    if (creatorPublicPage) {
      emptyCard?.removeAttribute('style');
      postsElement?.removeAttribute('style');
      postsElement?.nextElementSibling?.removeAttribute('style');
    } else {
      emptyCard?.parentElement?.removeAttribute('style');
      postsElement?.parentElement?.removeAttribute('style');
    }
    // Show the original posts
  } else {
    if (creatorPublicPage) {
      emptyCard?.setAttribute('style', 'display:none;');
      postsElement?.setAttribute('style', 'display:none;');
      postsElement?.nextElementSibling?.setAttribute('style', 'display:none;');
    } else {
      emptyCard?.parentElement.setAttribute('style', 'display:none;');
      postsElement?.parentElement.setAttribute('style', 'display:none;');
    }
  }
};

const WrapperPerPage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;
const PerPageItemContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
`;
const sizeOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
];

interface PostViewProps {
  isView: isViewType;
}
export const PostsView: FC<PostViewProps> = ({ isView }) => {
  const visitedPosts = useStorage(visitedPostsStorage);
  const allPosts = useStorage(postsStorage);
  const isEnable = useStorage(isEnableStorage);
  const dynamicConfig = useStorage(dynamicSelectorStorage);
  const postIsLoading = useStorage(postsIsLoadingStorage);
  const matcher = useStorage(matcherStorage);
  const currentPageS = useStorage(currentPageStorage);
  const bookMarkPosts = useStorage(bookmarkPostsStorage);
  const [postsData, setPostsData] = useState<PostData>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const itemsPerPage = useStorage(pageSizeStorage);
  const pinnedPostS = useStorage(pinnedPostStorage);
  const reqHasFilter = useStorage(isRequestHasFilterStorage);
  const [selectedChapter, setSelectedChapter] = useState<number>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const chapterId = useStorage(selectedPostAuthorStorage);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);
  const [loadingTip, setLoadingTip] = useState<string>();
  const [loadingTipIndex, setLoadingTipIndex] = useState<number>(0);

  useEffect(() => {
    if (chapterId && isView === 'Post') {
      setSelectedChapter(chapterId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  useEffect(() => {
    if (selectedChapter && !openModal) {
      setOpenModal(true);
    }
    if (selectedChapter && postsData) {
      if (!visitedPosts.includes(selectedChapter)) {
        visitedPostsStorage.add(selectedChapter).then();
      }
      const post = postsData?.posts?.find(p => p?.id === selectedChapter);
      bookmarkPostsStorage.add(post?.authorKeyLowerCase, { ...post, isBookMarkView: false }).then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapter]);

  const paginatedPosts = useMemo(() => {
    if (!postsData || !postsData.posts) {
      return [];
    }

    const postsList = postsData.posts;
    // paginated posts using currentPage, itemsPerPage and total
    return postsList?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [postsData, currentPage, itemsPerPage]);

  const getEmptyCard = (startTime: number = Date.now()) => {
    const emptyCard = document.querySelector(config.pages.posts.emptyCardSelector) as HTMLElement;

    if (Date.now() - startTime > 5000) {
      console.log('Stopping execution after 5 seconds');
      return;
    }
    if (!emptyCard) {
      setTimeout(() => getEmptyCard(startTime), 300);
      return;
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (!postIsLoading && isLoading) {
      if (paginatedPosts.length) {
        setIsLoading(false);
      }
      if (!postsData?.posts?.length) {
        getEmptyCard();
      }
    } else if (postIsLoading && !isLoading) {
      showTipContent();
      setIsLoading(true);
    }
  }, [isLoading, postIsLoading, paginatedPosts.length]);

  useEffect(() => {
    if (isView === 'Post') {
      toggleElements(isEnable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnable, postIsLoading]);

  useEffect(() => {
    const setPosts = async () => {
      const key = matcher === 'creatorPost' ? getKey(window?.location?.href) : getPostKeyByUrl(window?.location?.href);
      const thisPosts = allPosts[key];
      const pinPost = pinnedPostS[key];
      const page = currentPageS[key];

      if (!thisPosts) {
        return;
      }
      const pinnedPost = pinPost?.find(post => post?.isPinnedPost);
      const actualPost = !reqHasFilter
        ? thisPosts?.posts?.filter(post => post?.id !== pinnedPost?.id)
        : thisPosts?.posts;

      const newPosts = actualPost?.map((post, index) => ({ ...post, index }));

      if (page?.currentPage !== currentPage && postsData?.meta?.total !== thisPosts?.meta?.total) {
        // Set the current page from background storage only if it's different from the current page
        setCurrentPage(page?.currentPage ?? 1);
      }
      setPostsData({
        ...thisPosts,
        posts: pinPost?.length && !reqHasFilter ? [...pinPost, ...newPosts] : newPosts,
      });
      removeSubscriptionNode();
    };
    setPosts().then();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPosts, postsData?.meta?.total, pinnedPostS]);

  const total = useMemo(() => {
    return postsData?.meta?.total || 0;
  }, [postsData]);

  const authorKey = useMemo(() => {
    const key = matcher === 'creatorPost' ? getKey(window?.location?.href) : getPostKeyByUrl(window?.location?.href);
    return key;
  }, [matcher]);

  // set the current page
  useEffect(() => {
    const page = currentPageS[authorKey];

    setCurrentPage(page?.currentPage ?? 1);
  }, [currentPageS]);

  const triggerClickToLoadMore = () => {
    const loadMoreButton = [...document.querySelectorAll('button')].find(
      button => button.textContent === dynamicConfig?.loadMoreButtonText,
    );
    if (loadMoreButton) {
      loadMoreButton.click();
    }
  };

  const allowNext = useMemo(() => {
    const currentIndex = postsData?.posts?.findIndex(post => post.id === selectedChapter);
    const isLastPage = currentPage === Math.ceil(total / itemsPerPage);
    const isLastItem = currentIndex === postsData?.posts?.length - 1;
    return currentIndex < postsData?.posts?.length - 1 || (isLastItem && !isLastPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedPosts, selectedChapter, postsData]);

  const allowPrevious = useMemo(() => {
    return postsData?.posts?.findIndex(post => post.id === selectedChapter) > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedPosts, selectedChapter, postsData]);

  const handleChapterClick = (id: number) => {
    if (!openModal) {
      setOpenModal(true);
    }
    setSelectedChapter(prev => (prev === id ? null : id));
  };

  const handlePageChange = (page: number) => {
    currentPageStorage.setCurrentPage(authorKey, page).then();
    if (page * itemsPerPage > postsData.posts.length) {
      triggerClickToLoadMore();
    }
  };
  const showTipContent = () => {
    if (loadingTipIndex <= tipsArray?.length - 1) {
      setLoadingTip(tipsArray[loadingTipIndex]);
      loadingTipIndex === tipsArray?.length - 1 ? setLoadingTipIndex(0) : setLoadingTipIndex(prev => prev + 1);
    }
  };
  const handleNext = () => {
    const currentIndex = postsData?.posts.findIndex(post => post.id === selectedChapter);
    const isLastItem = currentIndex === postsData?.posts?.length - 1;
    const nextItem = postsData?.posts?.[currentIndex + 1];
    if (nextItem) {
      const newPage = Math.floor((currentIndex + 1) / itemsPerPage) + 1;
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        currentPageStorage.setCurrentPage(authorKey, newPage);
      }
      handleChapterClick(nextItem.id);
    } else if (isLastItem) {
      triggerClickToLoadMore();
    }
  };

  const handlePrevious = () => {
    const currentIndex = postsData?.posts?.findIndex(post => post.id === selectedChapter);
    const previousItem = postsData?.posts?.[currentIndex - 1];
    if (previousItem) {
      const newPage = Math.floor((currentIndex - 1) / itemsPerPage) + 1;
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        currentPageStorage.setCurrentPage(authorKey, newPage);
      }
      handleChapterClick(previousItem.id);
    }
  };

  const getPost = useCallback(
    (id: number) => {
      return postsData?.posts?.find(post => post.id === id);
    },
    [postsData],
  );

  const onPageSizeChange = async (value: string | number) => {
    await pageSizeStorage.add(Number(value));
    const lastPage = Math.ceil(postsData?.posts.length / Number(value));
    currentPageStorage.setCurrentPage(authorKey, currentPage > lastPage ? lastPage : currentPage);
  };

  const lastReadPost = useMemo(() => {
    const authorKey =
      matcher === 'creatorPost'
        ? getKey(window?.location?.href)
        : window.location.href.startsWith('https://www.patreon.com/user') //Todo: this is now only works with this type of authors that has no author name
          ? window.location.href
          : getPostKeyByUrl(window?.location?.href);
    return bookMarkPosts && authorKey ? bookMarkPosts[authorKey?.toLowerCase()] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookMarkPosts]);

  const showTheBookMark = async () => {
    const isCreator = document.querySelector('[aria-label="Create post"]');
    if (isCreator) {
      await bookmarkPostsStorage.add(lastReadPost?.authorKeyLowerCase, {
        ...lastReadPost,
        isBookMarkView: false,
        isCreatorView: true,
      });
    } else {
      await bookmarkPostsStorage.add(lastReadPost?.authorKeyLowerCase, { ...lastReadPost, isBookMarkView: false });
    }
    await isBookMarkViewStorage.toggle();
  };

  return (
    <div className="per-chapter-view">
      <PerPageItemContainer style={{ justifyContent: isEnable ? 'space-between' : 'center' }}>
        <TopButtons isView={isView} />
        {isEnable && (
          <WrapperPerPage>
            <PageSizeSelector
              hidden
              options={sizeOptions ?? []}
              onChange={value => onPageSizeChange(value)}
              defaultValue={itemsPerPage}
            />
            <span>Posts Per Page</span>
          </WrapperPerPage>
        )}
      </PerPageItemContainer>
      {lastReadPost && lastReadPost?.id && !window?.location?.href.startsWith('https://www.patreon.com/user') ? (
        <div style={{ margin: '8px 0px', display: 'flex' }}>
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Last Read Post:</span>
          <span
            style={{
              marginLeft: '5px',
              cursor: 'pointer',
              display: 'block',
              width: 'fit-content',
              textDecoration: 'underline',
            }}
            data-tooltip-id={`my-tooltip-title-last-post`}
            data-tooltip-content={lastReadPost?.title?.length >= 51 ? lastReadPost?.title : ''}
            className="truncate-string"
            onClick={showTheBookMark}>
            {lastReadPost?.title}
          </span>
        </div>
      ) : null}
      {!window?.location?.href.startsWith('https://www.patreon.com/user') && paginatedPosts?.length > 0 && isEnable && (
        <>
          {!postIsLoading ? (
            <PostSelectionActionButton
              currentPage={currentPage}
              view="post-view"
              readeonView={isView}
              showCheckboxes={showCheckboxes}
              setShowCheckboxes={setShowCheckboxes}
            />
          ) : (
            <span>Loading...</span>
          )}
        </>
      )}
      {isEnable && (
        <>
          <PerChapter
            lastReadPost={lastReadPost}
            posts={paginatedPosts}
            isLoading={isLoading}
            loadingTip={loadingTip}
            handleClick={handleChapterClick}
            view={'post-view'}
            showCheckboxes={showCheckboxes}
          />

          {paginatedPosts?.length > 0 ? (
            <Pagination
              isLoading={isLoading}
              currentPage={currentPage}
              totalItems={total}
              itemsPerPage={itemsPerPage}
              isDisabled={isLoading}
              onPageChange={handlePageChange}
            />
          ) : null}
        </>
      )}

      {openModal ? (
        <FullScreen
          showBookMarkIcon={false}
          isRecentView={false}
          isOpen={openModal}
          postData={getPost(selectedChapter)}
          allowNext={allowNext}
          allowPrevious={allowPrevious}
          showNavigation={true}
          loadingTip={loadingTip}
          onClose={() => {
            setOpenModal(false);
            setSelectedChapter(null);
            selectedPostAuthorStorage.clear().then();
          }}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      ) : null}
      <Tooltip
        id={`my-tooltip-title-last-post`}
        place="top"
        style={{ width: '300px', backgroundColor: '#000', textAlign: 'center' }}
        opacity={1}
      />
    </div>
  );
};

export default PostsView;
