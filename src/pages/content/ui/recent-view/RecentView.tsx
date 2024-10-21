/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { FC, useEffect, useState, useMemo, memo } from 'react';
import useStorage from '@src/shared/hooks/useStorage';
import recentPostsStorage from '@src/shared/storages/recent-posts/recentPostsStorage';
import { Post } from '@src/shared/storages/posts/postsStorage';
import { PerChapter } from '@src/shared/components/per-chapter/PerChapter';
import { TopButtons } from '@src/shared/components/top-buttons/TopButtons';
import config from '@src/config';
import isEnableStorage from '@src/shared/storages/isEnableStorage';
import selectedFromRecentPostsStorage from '@src/shared/storages/recent-posts/selectedFromRecentPostsStorage';
import { selectedAuthorRecentPost } from '@root/src/shared/components/full-screen/utils';
import bookmarkPostsStorage from '@root/src/shared/storages/bookmarkPostStorage';
import { Tooltip } from 'react-tooltip';
import authorKeyStorage from '@root/src/shared/storages/recent-posts/authorKeyStorage';
import PostSelectionActionButton from '@root/src/shared/components/action-button';

export interface RecentViewProps {
  authorKey: string;
  targetElement: HTMLElement;
  authorKeyCamelCase?: string;
}

const RecentView: FC<RecentViewProps> = ({ authorKey, targetElement, authorKeyCamelCase }) => {
  const allRecentPosts = useStorage(recentPostsStorage);
  const isEnable = useStorage(isEnableStorage);
  const bookMarkPosts = useStorage(bookmarkPostsStorage);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);

  useEffect(() => {
    if (!allRecentPosts?.length) return;
    const authorRecentPosts = allRecentPosts.filter(post => post.authorKeyLowerCase === authorKey);
    setPosts(authorRecentPosts);
  }, [allRecentPosts, authorKey]);

  useEffect(() => {
    const toggleElements = (isEnable: boolean) => {
      const rootAuthorElement = targetElement.closest(config.pages.recentPosts.rootAuthorSelector);
      const postElements = rootAuthorElement.querySelectorAll(config.pages.recentPosts.postSelector);

      if (!postElements.length) {
        return;
      }
      // Always show the original posts when chapter view is disabled or no matching authorKey
      if (!isEnable || !allRecentPosts.some(post => post.authorKeyLowerCase === authorKey)) {
        [...postElements].forEach(element => element.removeAttribute('style'));
        return;
      }
      // Hide the original posts when chapter view is enabled and matching authorKey is found
      [...postElements].forEach(element => element.setAttribute('style', 'display: none'));
    };
    toggleElements(isEnable);
  }, [isEnable, targetElement, allRecentPosts, authorKey]);

  const handleChapterClick = async (id: number) => {
    const post = allRecentPosts?.find(post => post.id === id);
    injectComments(authorKey, post?.index, post);
    setTimeout(async () => {
      await selectedFromRecentPostsStorage.set(id);
    }, 200);
  };

  const lastReadPost = useMemo(() => {
    return bookMarkPosts ? bookMarkPosts[authorKey] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookMarkPosts]);

  const showTheBookMark = async () => {
    const filteredPosts = allRecentPosts?.find(post => post.id === lastReadPost?.id);
    if (filteredPosts) {
      await authorKeyStorage.add(authorKey);
      await bookmarkPostsStorage.add(lastReadPost?.authorKeyLowerCase, { ...lastReadPost, isBookMarkView: false });
    }
  };

  const getTooltipContent = (lastReadPost: Post, allRecentPosts: Post[], authorKey: string) => {
    const postExists = allRecentPosts?.find(post => post?.id === lastReadPost?.id);

    if (lastReadPost?.title?.length >= 51 && postExists && authorKey === lastReadPost?.authorKeyLowerCase) {
      return lastReadPost?.title;
    }

    if (!postExists && authorKey === lastReadPost?.authorKeyLowerCase) {
      return 'Last read post doesn’t exist on this page. Please visit the creator’s page to access';
    }

    return '';
  };

  //Todo: Should be optimized once we have better solution for this

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return null;
  }

  if (posts?.length) {
    return (
      <div>
        <TopButtons authorKey={authorKey} isRecentView isView="Recent" />
        {lastReadPost ? (
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
              data-tooltip-id={`my-tooltip-title-last-post-${authorKey}`}
              data-tooltip-content={getTooltipContent(lastReadPost, allRecentPosts, authorKey)}
              className="truncate-string"
              onClick={showTheBookMark}>
              {lastReadPost?.title}
            </span>
          </div>
        ) : null}
        {isEnable && (
          <PostSelectionActionButton
            view={'recent-view'}
            authorKey={authorKeyCamelCase}
            showCheckboxes={showCheckboxes}
            setShowCheckboxes={setShowCheckboxes}
          />
        )}
        {isEnable ? (
          <PerChapter
            posts={posts}
            lastReadPost={lastReadPost}
            isLoading={false}
            authorKey={authorKeyCamelCase}
            isEnableShowOnlyChapters={true}
            handleClick={handleChapterClick}
            view="recent-view"
            showCheckboxes={showCheckboxes}
          />
        ) : null}
        <Tooltip
          id={`my-tooltip-title-last-post-${authorKey}`}
          place="top"
          style={{ width: '300px', backgroundColor: '#000', textAlign: 'center' }}
          opacity={1}
        />
      </div>
    );
  }
  if (posts?.length === 0) {
    return (
      <div
        style={{
          border: 'var(--global-borderWidth-thin) solid var(--global-border-action-default)',
          borderRadius: 'var(--global-radius-md)',
          padding: '16px',
          textAlign: 'center',
          color: '#FF7F3E',
        }}>
        Readeon does not support “Readeon View” for this creator in Home view.
      </div>
    );
  }
  return <></>;
};

export default memo(RecentView, (p, n) => p.authorKey !== n.authorKey);

export const injectComments = async (authorKey: string, itemIndex: number, post: Post) => {
  if (!authorKey || isNaN(itemIndex)) {
    return;
  }

  const authorPost = selectedAuthorRecentPost(authorKey);

  if (authorPost?.length > 0) {
    const element = authorPost?.[itemIndex];

    if (!element) return;

    const showMore = element?.querySelector(config.pages.recentPosts.showMoreSelector) as HTMLButtonElement;
    const postTitle = element?.querySelector(config.pages.recentPosts.postTitleSelector) as HTMLAnchorElement;
    const commentBtn = element.querySelector(config.pages.posts.showCommentSelector) as HTMLButtonElement;
    const commentVisible = element?.querySelector(config.pages.recentPosts.commentsSelector);

    if (!commentVisible && showMore) showMore?.click();
    else if (!commentVisible && commentBtn && post?.isView) commentBtn?.click();
    !showMore && setTimeout(() => postTitle?.focus(), 200);
  }
};
