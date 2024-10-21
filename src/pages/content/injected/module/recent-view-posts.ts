/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import postsIsLoadingStorage from '@root/src/shared/storages/posts/postsIsLoadingStorage';
import { Post } from '@root/src/shared/storages/posts/postsStorage';
import recentPostsStorage from '@root/src/shared/storages/recent-posts/recentPostsStorage';
import { generatePost } from '@root/src/shared/utils/background';

export const createPostsRecent = async (postData: Record<string, any>) => {
  try {
    const posts: Post[] = [];
    postData?.included?.forEach((data: any) => {
      if (data.type === 'post') {
        posts.push(generatePost(data, 'recent') as Post);
      }
    }) as Post[];
    //binding the multiple images with post
    const imagesAdded = posts?.map(post => {
      const multipleImages = post?.metaImages?.length
        ? postData?.included?.filter(item => post?.metaImages?.includes(item?.id))
        : [];
      const user = postData?.included?.find(
        item => item?.attributes?.vanity === post?.authorKey && item?.type === 'campaign',
      );
      return {
        ...post,
        multipleImages,
        user,
      };
    });
    if (imagesAdded?.length) {
      await recentPostsStorage.add(imagesAdded);
    }
  } catch (error) {
    console.log('error', { error });
    await postsIsLoadingStorage.setLoading(false);
  } finally {
    await postsIsLoadingStorage.setLoading(false);
  }
};
