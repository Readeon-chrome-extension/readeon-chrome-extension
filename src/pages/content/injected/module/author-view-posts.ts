/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import config from '@root/src/config';
import creatorProfileStorage from '@root/src/shared/storages/creatorProfileStorage';
import extEnableStorage from '@root/src/shared/storages/extEnableStorage';
import isRequestHasFilterStorage from '@root/src/shared/storages/isRequesHasFilterStorage';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import pinnedPostStorage from '@root/src/shared/storages/pinnedPostStorage';
import currentPageStorage from '@root/src/shared/storages/posts/currentPage';
import postsIsLoadingStorage from '@root/src/shared/storages/posts/postsIsLoadingStorage';
import postsStorage, { Post } from '@root/src/shared/storages/posts/postsStorage';
import { PostRequest, generatePost } from '@root/src/shared/utils/background';
import { getKey, getPostKeyByUrl } from '@root/src/shared/utils/posts';

let lastRequestUrl: string;

export const createPostsAuthors = async (postData: Record<string, any>, url: string) => {
  const extEnabled = await extEnableStorage.get();
  if (!extEnabled) return;

  const currentLocation = window?.location?.href;
  const isFeaturePost = url?.includes(config?.ApiRoutes?.featurePostsRoute);
  const matcher = await matcherStorage.get();
  let posts: Post[] = [];
  lastRequestUrl = url;
  const query = url?.split('?')[1];
  const params = new URLSearchParams(query);
  const postsViewKey = matcher === 'creatorPost' ? getKey(currentLocation) : getPostKeyByUrl(currentLocation);

  try {
    if (isRequestHasWithoutPagination(params)) {
      // console.log('### Clearing postsStorage due to no pagination');
      await currentPageStorage.clear(postsViewKey);
      await postsStorage.clear(postsViewKey);
    }
    if (isRequestHasFilter(params) && !isFeaturePost) {
      await isRequestHasFilterStorage.add(true);
    } else if (!isFeaturePost) {
      await isRequestHasFilterStorage.add(false);
    }
    if (isFeaturePost && !postData?.included?.length) return;

    if (isFeaturePost && postData?.included?.length) {
      posts = postData?.included?.reduce((acc: any, data: any) => {
        if (data.type === 'post') {
          acc.push(generatePost(data, 'author', 'api1', true));
        }
        return acc;
      }, []) as Post[];
    } else if (!isFeaturePost && postData?.data?.length) {
      posts = postData?.data?.map((post: PostRequest) => generatePost(post, 'author'));
    }
    const user = isFeaturePost ? postData?.data : postData?.included?.find(item => item?.type === 'campaign');
    const imagesAdded = posts?.map(post => {
      const multipleImages = postData?.included?.filter(item => post?.metaImages?.includes(item?.id)) ?? [];

      return {
        ...post,
        multipleImages,
        user,
      };
    });

    if (user) {
      await creatorProfileStorage.add(user, postsViewKey);
    }
    // Assuming postsStorage is a module that handles storage operations and it's already imported
    if (imagesAdded?.length > 0 && isFeaturePost) {
      await pinnedPostStorage.add(postsViewKey, imagesAdded);
    } else if (!isFeaturePost) {
      await postsStorage.add(postsViewKey, imagesAdded, postData?.meta?.pagination?.total ?? imagesAdded?.length);

      if (isRequestHasWithoutPagination(params)) {
        await currentPageStorage.setCurrentPage(postsViewKey, 1).then();
      }
    }
  } catch (error) {
    console.log(error);
    postsIsLoadingStorage.setLoading(false).then();
  } finally {
    postsIsLoadingStorage.setLoading(false).then();
  }
};
const isRequestHasWithoutPagination = (params: URLSearchParams) => {
  const paramsFromLastRequest = lastRequestUrl && new URLSearchParams(lastRequestUrl.split('?')[1]);
  const hasPagination = 'page[cursor]';
  const isRequestHasPagination = params.has(hasPagination);
  const isLastRequestHasPagination = paramsFromLastRequest && paramsFromLastRequest.has(hasPagination);
  return (
    (!isRequestHasPagination && isLastRequestHasPagination) || (!isRequestHasPagination && !isLastRequestHasPagination)
  );
};
const isRequestHasFilter = (params: URLSearchParams) => {
  // ToDo: add the filter in config file
  const mediaFilter = 'filter[media_types]';
  const publicFilter = 'filter[is_public]';
  const tierFilter = 'filter[tier_id]';
  const monthFilter = 'filter[month]';
  const freeMemberFilter = 'filter[free_members]';
  const emailFilter = 'filter[search_query]';

  return (
    params.has(mediaFilter) ||
    params.has(publicFilter) ||
    params.has(tierFilter) ||
    params.has(monthFilter) ||
    params.has(freeMemberFilter) ||
    params.has(emailFilter)
  );
};
