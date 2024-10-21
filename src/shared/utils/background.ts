/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
export const getCurrentTabUrl = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.url;
};
export const makeFetch = async (url: string, headers: Headers, method: string) => {
  try {
    const response = await fetch(url, { method, headers });
    return response;
  } catch (error) {
    console.log('Error', { error });
  }
};
export interface PostRequest {
  id: any;
  attributes: {
    title: any;
    content: any;
    embed: {
      html: string;
      url: string;
      provider: string;
    };
    image: any;
    patreon_url: any;
    published_at: any;
    comment_count: any;
    post_type: any;
    post_metadata: any;
    teaser_text: string;
    current_user_can_view: boolean;
    upgrade_url: string;
    current_user_can_comment: boolean;
  };
  relationships: {
    user_defined_tags: { data: any[] };
    images: { data: any[] };
  };
}
export const generatePost = (post: PostRequest, page: 'author' | 'recent', apiFrom = 'api2', isPinnedPost = false) => {
  const metaImage =
    page === 'author'
      ? post?.attributes?.post_metadata?.image_order ?? []
      : post?.relationships?.images?.data?.map((item: any) => item?.id);
  let authorKey: string;
  if (post?.attributes?.upgrade_url?.includes('/checkout')) {
    authorKey = post?.attributes?.upgrade_url.replace('/checkout/', '').split('?')[0];
  } else {
    authorKey = post?.attributes?.upgrade_url.replace('/join/', '').split('?')[0];
  }
  return {
    id: post?.id,
    title: post?.attributes?.title,
    content: post?.attributes?.current_user_can_view
      ? post?.attributes?.content ?? ''
      : `<p>${post?.attributes?.teaser_text ?? ''}</p>`,
    image: post?.attributes?.image,
    url: post?.attributes?.patreon_url,
    publishedAt: post?.attributes?.published_at,
    commentsCount: post?.attributes?.comment_count,
    patreon_url: post?.attributes?.patreon_url,
    hasAudio: post?.attributes?.post_type === 'audio_file',
    hasVideo: post?.attributes?.post_type === 'video_external_file',
    hasLink: getPostLinkType(post),
    hadEmbedVideo: post?.attributes?.post_type === 'video_embed',
    isPoll: post?.attributes.post_type === 'poll',
    hasTags: !!post?.relationships?.user_defined_tags?.data?.length,
    isView: post?.attributes?.current_user_can_view,
    upgrade_url: post?.attributes?.upgrade_url,
    isPinnedPost,
    apiFrom,
    postType: post?.attributes?.post_type,
    metaImages: metaImage,
    authorKey: authorKey,
    authorKeyLowerCase: authorKey?.toLowerCase(),
    hasLiveStream: post?.attributes?.post_type.startsWith('livestream'),
    userCanComment: post?.attributes?.current_user_can_comment,
  };
};
const getPostLinkType = (post: PostRequest) => {
  const isLinkPost = post?.attributes?.post_type === 'link';
  const isYouTubeUrl =
    post?.attributes?.embed?.url?.startsWith('http://youtube.com') ||
    post?.attributes?.embed?.url?.startsWith('https://www.youtube.com') ||
    post?.attributes?.embed?.provider === 'YouTube';

  if (isLinkPost && isYouTubeUrl) {
    return false;
  } else if (isLinkPost && post?.attributes?.embed) {
    return true;
  }
};
