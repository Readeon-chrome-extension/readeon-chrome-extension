/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { Post } from '@src/shared/storages/posts/postsStorage';
import React, { FC, useEffect, useState } from 'react';
import { Loader } from '@src/shared/components/loader/Loader';
import useStorage from '@src/shared/hooks/useStorage';
import visitedPostsStorage from '@src/shared/storages/visitedPostsStorage';
import dayjs from 'dayjs';
import styled from '@emotion/styled';
import showOnlyChaptersStorage from '@src/shared/storages/posts/showOnlyChaptersStorage';
import config from '@src/config';
import { Button } from '@src/shared/components/button/Button';
import { PinnedIcon } from '@src/shared/components/full-screen/upgradeIcon';
import { ArrowBigRight, FileText, LockKeyhole } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import checkboxIdsStorage from '@root/src/shared/storages/checkboxStorage';
import downloadFeatureToggleStorage, { getStorageKey } from '@root/src/shared/storages/downloadFeatureToggleStorage';
export interface PerChapterProps {
  posts: Post[];
  isLoading: boolean;
  isEnableShowOnlyChapters?: boolean;
  handleClick: (postId: number) => void;
  lastReadPost?: Post;
  view: 'recent-view' | 'post-view';
  showCheckboxes: boolean;
  loadingTip?: string;
  authorKey?: string;
}

const setDate = (date: string) => {
  return dayjs(date).fromNow();
};

const isPostChapter = (title: string) => {
  const regex = config.misc.showOnlyChapters.regex;
  return regex.test(title.toLowerCase());
};

const PerChapterView = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  padding: 10px 0;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3f3f3f;
  /* opacity: 0.5; */
`;

const HeaderItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  height: 600px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 12px;
`;

interface ItemProps {
  isChapter: boolean;
}

const Item = styled.div`
  padding: 16px 0;
  // &:not(:last-child) {
  //   border-bottom: 1px solid #3f3f3f;
  // }
  width: 100%;
  @media (min-width: 768px) {
    padding: 24px 0;
  }
`;

const ItemTitle = styled.a`
  width: 100%;
  cursor: pointer;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;

  .last-read-icon svg {
    fill: var(--global-content-regular-default);
    color: var(--global-content-regular-default);
    margin-top: 4px;
    height: 20px;
  }
  .pinned-icon-wrapper svg {
    height: 18px;
    width: 18px;
    margin-top: 5px;
    fill: var(--global-content-regular-default);
  }
`;

const PublishedAt = styled.div`
  text-align: right;
  font-size: 12px;
  color: var(--global-content-regular-default);
  white-space: nowrap;
`;
const StyledTitle = styled.h3<ItemProps>`
  // padding-right: 8px;
  // width: 100%;
  overflow-wrap: anywhere;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  // width: 450px;
  &.visited {
    opacity: 0.5;
  }
  color: ${({ isChapter }) =>
    isChapter ? 'var(--global-content-regular-default)' : 'var(--global-content-muted-default)'};
  opacity: ${({ isChapter }) => (isChapter ? '' : '0.5')};
`;

export const PerChapter: FC<PerChapterProps> = ({
  posts,
  isLoading,
  isEnableShowOnlyChapters = true,
  handleClick,
  lastReadPost,
  view,
  loadingTip,
  showCheckboxes,
  authorKey,
}) => {
  const hasClicked = useStorage(downloadFeatureToggleStorage);
  const visitedPosts = useStorage(visitedPostsStorage);
  const showOnlyChapters = useStorage(showOnlyChaptersStorage);
  const [showRefreshButton, setShowRefreshButton] = React.useState<boolean>(false);
  const selectedIds = useStorage(checkboxIdsStorage);
  const [emptyCard, setEmptyCard] = useState<Element>();
  useEffect(() => {
    setTimeout(() => {
      const ele = document.querySelector(config.pages.posts.emptyCardSelector);
      setEmptyCard(ele);
    }, 300);
  }, [posts, isLoading]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowRefreshButton(true);
      }, 15000); // 20000ms = 20 second

      return () => clearTimeout(timer); // Cleanup timeout if loading stops
    } else {
      setShowRefreshButton(false);
    }
  }, [isLoading]);

  const handleChapterClick = (id: number) => {
    handleClick(id);
    if (!visitedPosts.includes(id)) {
      visitedPostsStorage.add(id).then();
    }
  };

  const handleCheckboxChange = async (post: Post) => {
    const authorKey = post?.authorKeyLowerCase;
    const postId = String(post?.id);
    const authorSpecificPostIds = selectedIds?.[authorKey] || [];

    if (authorSpecificPostIds?.includes(postId)) {
      await checkboxIdsStorage.removePostId(authorKey, postId);
    } else {
      await checkboxIdsStorage.addPostId(authorKey, postId);
    }
  };

  const reload = () => {
    window?.location?.reload();
  };

  return (
    <PerChapterView>
      <Header>
        <HeaderItem>Post Name</HeaderItem>
        <HeaderItem>Release Date</HeaderItem>
      </Header>

      {isLoading && (
        <LoaderWrapper>
          <p style={{ fontSize: '16px', textAlign: 'center' }}>
            While posts are loading, other Readeon buttons may not be clickable. Refresh the page if you must.
          </p>
          <Loader />

          {loadingTip && !showRefreshButton && <p style={{ fontSize: '16px', textAlign: 'center' }}>{loadingTip}</p>}
          {showRefreshButton && (
            <>
              <p style={{ fontSize: '16px', textAlign: 'center' }}>
                Loading posts seems to be taking too long. Please try again after clicking on the reload button below.
              </p>
              <Button onClick={reload} text="Reload" />
            </>
          )}
        </LoaderWrapper>
      )}
      <div
        id="readeon-post-list-container"
        style={{ width: '100%' }}
        data-author-key={view === 'recent-view' ? authorKey : null}>
        {!isLoading &&
          posts?.map((post, index) => (
            <Item key={post.id} style={{ borderBottom: index !== posts.length - 1 ? '1px solid #3f3f3f' : 'unset' }}>
              <ItemTitle
                id={`chapter-${post.id}`}
                onClick={event => {
                  event.preventDefault();
                  handleChapterClick(post.id);
                }}
                href="#">
                <div className="post-view-row" style={{ alignItems: 'center', gap: '6px', width: '75%' }}>
                  <div className="post-icon-wrapper">
                    {!window?.location?.href.startsWith('https://www.patreon.com/user') ? (
                      post?.isView ? (
                        hasClicked[getStorageKey(post.authorKeyLowerCase, view)] || showCheckboxes ? (
                          <input
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                            }}
                            data-post-id={post?.id}
                            checked={selectedIds?.[post?.authorKeyLowerCase]?.includes(String(post?.id)) || false}
                            type="checkbox"
                            className="post-selection-checkbox"
                            onChange={e => {
                              e.stopPropagation();
                              handleCheckboxChange(post);
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : null
                      ) : (
                        <LockKeyhole
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="readeon-locked-post"
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'default',
                            outline: 'none',
                            color: 'var(--global-content-regular-default)',
                          }}
                          data-tooltip-id="my-tooltip-title"
                          data-tooltip-content={'This post is locked and cannot be downloaded'}
                        />
                      )
                    ) : null}
                    {lastReadPost?.id === post?.id &&
                      !window?.location?.href.startsWith('https://www.patreon.com/user?u') && (
                        <span className="last-read-icon">
                          <ArrowBigRight />
                        </span>
                      )}
                  </div>
                  <div
                    style={{ width: '100%' }}
                    data-tooltip-id={`my-tooltip-title`}
                    data-tooltip-content={post?.title?.length >= 51 ? post?.title : ''}>
                    <StyledTitle
                      isChapter={!isEnableShowOnlyChapters || !showOnlyChapters || isPostChapter(post.title)}
                      // style={{ width: post?.title?.length >= 51 ? '450px' : 'fit-content' }}
                      className={visitedPosts.includes(post.id) ? 'visited' : ''}>
                      {post?.title}
                    </StyledTitle>
                  </div>
                  {post?.isPinnedPost && (
                    <div className="pinned-icon-wrapper">
                      <PinnedIcon />
                    </div>
                  )}
                </div>
                <PublishedAt>{setDate(post.publishedAt)}</PublishedAt>
              </ItemTitle>
            </Item>
          ))}
      </div>
      {!isLoading && !posts?.length && emptyCard && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          }}>
          <div className="no-data-fond">
            <FileText size={20} />
            No Posts Found
          </div>
        </div>
      )}
      <Tooltip
        id={`my-tooltip-title`}
        place="top"
        style={{ width: '300px', backgroundColor: '#000', textAlign: 'center', zIndex: 1200 }}
        opacity={1}
      />
    </PerChapterView>
  );
};
