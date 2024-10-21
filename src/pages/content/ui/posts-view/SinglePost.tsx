/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import config from '@root/src/config';
import React from 'react';
import { createButton } from '@src/pages/content/ui/posts-view';
import { Post } from '@root/src/shared/storages/posts/postsStorage';
import useStorage from '@root/src/shared/hooks/useStorage';
import bookmarkPostsStorage from '@root/src/shared/storages/bookmarkPostStorage';
import FullScreen from '@root/src/shared/components/full-screen/FullScreen';
import singlePostStorage from '@root/src/shared/storages/singlePostStorage';
interface SinglePostProps {
  authorKey: string;
  targetElement: Element;
}
const SinglePost: React.FC<SinglePostProps> = ({ authorKey, targetElement }) => {
  const bookmarkPosts = useStorage(bookmarkPostsStorage);
  const singlePost = useStorage(singlePostStorage);
  const [selectedPost, setSelectedPost] = React.useState<Post>(null);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    const storedPost = authorKey && bookmarkPosts ? bookmarkPosts[authorKey] : null;

    if (storedPost && storedPost?.id && singlePost?.isValidPost) {
      setSelectedPost({ ...storedPost, isPinnedPost: true });
      mountFullScreenButton();
    } else {
      const element = targetElement?.querySelector('[span="2"]');
      if (element) {
        const isExist = document.getElementById('single-post-warning-container');

        if (isExist) isExist.remove();

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
  }, [bookmarkPosts]);

  const clickHandler = () => {
    setIsOpen(true);
  };
  const mountFullScreenButton = () => {
    const postElement = targetElement?.querySelector(`${config.pages.posts.singlePostSelector}`);

    const buttonEle = createButton(0);
    const title = postElement?.querySelector('[data-tag="post-title"]');
    title?.setAttribute('style', 'display:flex;width:100%;justify-content:space-between;');
    title?.parentElement?.appendChild(buttonEle);

    buttonEle.addEventListener('click', clickHandler);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      {isOpen && selectedPost && (
        <FullScreen
          isRecentView={false}
          isOpen={isOpen}
          postData={selectedPost}
          showNavigation={false}
          showBookMarkIcon={false}
          onClose={handleClose}
        />
      )}
    </>
  );
};
export default SinglePost;
