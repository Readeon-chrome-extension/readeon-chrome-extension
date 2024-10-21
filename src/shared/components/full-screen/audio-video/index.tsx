/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { SelectorConfig } from '@root/src/shared/storages/configStorage';
import { Post } from '@root/src/shared/storages/posts/postsStorage';
import React from 'react';
import { authorRecentPost, moveAudio, moveVideo } from '../utils';
import WarningContainer from '../warningContainer';

interface AudioVideoProps {
  post: Post;
  isOpen: boolean;
  isRecentView: boolean;
  dynamicConfig: SelectorConfig;
}
const AudioVideo: React.FC<AudioVideoProps> = ({ post, isOpen, isRecentView, dynamicConfig }) => {
  //getting the audio file from here
  React.useEffect(() => {
    if (!post?.hasAudio || !isOpen) {
      return;
    }
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (post?.hasAudio && mutation.type === 'childList' && document.querySelector('.full-screen__audio')) {
          isRecentView
            ? authorRecentPost(post?.authorKey, post?.index, false, true)
            : moveAudio(post?.index, post?.isPinnedPost, dynamicConfig);
          observer.disconnect();
          break;
        }
      }
    });

    observer.observe(document.body, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.index, post?.hasAudio, isOpen]);

  React.useEffect(() => {
    if (!(post?.hasVideo || post?.hasLink) || !isOpen) {
      return;
    }
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (
          (post?.hasVideo || post?.hasLink) &&
          mutation.type === 'childList' &&
          document.querySelector('.full-screen__video')
        ) {
          isRecentView
            ? authorRecentPost(post?.authorKey, post?.index, false, false, post?.hasVideo, post?.hasLink)
            : moveVideo(post?.index, post?.isPinnedPost, dynamicConfig, post?.hasLink);
          observer.disconnect();
          break;
        }
      }
    });

    observer.observe(document.body, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.index, post?.hasVideo, isOpen]);

  return (
    <>
      {post?.hasLiveStream && (
        <div className="full-screen__container">
          <WarningContainer
            text={`This post contains a livestream. Readeon does not support the viewing of livestream. To view the livestream,
            watch it with the extension turned off or simply click on the livestream with the "Readeon View” turned
            off.`}
          />
        </div>
      )}
      {((!post?.hasLink && post?.postType === 'link') || post?.hadEmbedVideo) && (
        <div className="full-screen__container">
          <WarningContainer
            text={`Readeon does not support the video link for this post. Please exit Full Screen mode to view. `}
          />
        </div>
      )}
      {(post?.hasVideo || post?.hasLink) && <div className="full-screen__video full-screen__container" />}
      {post?.hasAudio && <div className="full-screen__audio full-screen__container" />}
    </>
  );
};
export default AudioVideo;
