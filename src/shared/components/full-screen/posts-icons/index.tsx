/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { SelectorConfig } from '@root/src/shared/storages/configStorage';
import { Post } from '@root/src/shared/storages/posts/postsStorage';
import React, { FC } from 'react';
import { authorRecentPost, moveCommentsAuthor, movePostDetails } from '../utils';

interface PostIconsProps {
  showActionItem: boolean;
  showComments: boolean;
  post: Post;
  isOpen: boolean;
  dynamicConfig: SelectorConfig;
  isRecentView: boolean;
}

const PostIcons: FC<PostIconsProps> = ({ isOpen, showActionItem, showComments, post, dynamicConfig, isRecentView }) => {
  //getting the comments details

  React.useEffect(() => {
    if (showComments) {
      const observer = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && document.querySelector('.full-screen__comments')) {
            observer.disconnect();
            break;
          }
        }
      });

      isRecentView
        ? authorRecentPost(post?.authorKey, post?.index, true)
        : moveCommentsAuthor(post?.index, post?.isPinnedPost, dynamicConfig);

      // Start observing the document body only if FullScreen opened without comments (first time render).
      observer.observe(document.body, { subtree: true, childList: true });

      return () => {
        observer.disconnect();
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, post?.index, post?.authorKey]);
  //Adding the post actions details in full screen view

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && document.querySelector('.full-screen__post-details-actions')) {
          observer.disconnect();
          break;
        }
      }
    });
    isRecentView
      ? authorRecentPost(post?.authorKey, post?.index, false)
      : movePostDetails(post?.index, post?.isPinnedPost, dynamicConfig);

    // Start observing the document body only if FullScreen opened without comments (first time render).
    observer.observe(document.body, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.index, post?.authorKey, isOpen]);

  return (
    <div style={{ backgroundColor: 'var(--global-bg-page-default)' }}>
      {showActionItem ? (
        <div
          className="full-screen__post-details-actions full-screen__container"
          id="post-actions-details"
          style={{ width: '99%', margin: '4px 0 4px 4px' }}
        />
      ) : (
        <div
          style={{
            border: 'var(--global-borderWidth-thin) solid var(--global-border-action-default)',
            borderRadius: 'var(--global-radius-md)',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center',
            color: '#FF7F3E',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%',
          }}>
          {isRecentView
            ? `Post icons like comments cannot be shown by Readeon for this creator in Home view. Please exit Full Screen mode to view icons.`
            : 'Post icons like comments cannot be shown by Readeon for this post. Please exit Full Screen mode to view icons'}
        </div>
      )}
      <div
        className="full-screen__comments full-screen__container"
        style={{
          display: showActionItem ? 'block' : 'none',
          padding: 0,
          margin: showComments ? '10px 0' : '0px',
          width: '100%',
        }}>
        <>
          {showComments && <div className="full-screen__comments-title">Comments</div>}
          {post?.isView && post?.userCanComment ? (
            <div className="full-screen__comments-content" style={{ display: showComments ? 'block' : 'none' }} />
          ) : showComments ? (
            <div style={{ display: 'flex' }}>
              <div
                style={{
                  border: 'var(--global-borderWidth-thin) solid var(--global-border-action-default)',
                  borderRadius: 'var(--global-radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#FF7F3E',
                  width: '100%',
                }}>
                Unlock post to comment
              </div>
            </div>
          ) : null}
        </>
      </div>
    </div>
  );
};

export default PostIcons;
