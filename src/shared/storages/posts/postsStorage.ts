/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

export type Post = {
  id: number;
  authorKey: string;
  title: string;
  apiFrom?: string;
  content: string;
  image: {
    large_url: string;
    thumb_url: string;
    thumb_square_large_url: string;
    thumb_square_url: string;
    url: string;
    width: number;
  };
  url: string;
  metaImages?: string[];
  publishedAt: string;
  index: number;
  commentsCount: number;
  hasAudio?: boolean;
  isPoll?: boolean;
  patreon_url?: string;
  upgrade_url?: string;
  isView?: boolean;
  hasTags?: boolean;
  isBookMarkView?: boolean;
  isPinnedPost?: boolean;
  multipleImages: {
    attributes: {
      image_urls: {
        url: string;
        thumbnail_large: string;
        thumbnail_small: string;
        original: string;
        default: string;
        small: string;
      };
      display: {
        height: number;
        width: number;
        url: string;
      };
    };
    id: string;
  }[];
  hasVideo?: boolean;
  hasLink?: boolean;
  authorKeyLowerCase: string;
  isCreatorView?: boolean;
  hasLiveStream?: boolean;
  isGoToPostClicked?: boolean;
  userCanComment?: boolean;
  hadEmbedVideo?: boolean;
  postType?: string;
  user: UserProfile;
};

export type UserProfile = {
  attributes: {
    avatar_photo_image_urls: {
      default: string;
      default_small: string;
      thumbnail_small: string;
      thumbnail_large: string;
    };
    name: string;
    url: string;
    vanity: string;
  };
};
export type PostData = {
  posts: Post[];
  meta: {
    total: number;
  };
};

export type PagePosts = {
  [key: string]: PostData;
};

export type PostsStorage = BaseStorage<PagePosts> & {
  clear: (key: string) => Promise<void>;
  add: (key: string, posts: Post[], total: number) => Promise<void>;
  delete: () => Promise<void>;
};

const storage = createStorage<PagePosts>(
  'posts-storage-key',
  {},
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const postsStorage: PostsStorage = {
  ...storage,
  clear: async key => {
    await storage.set(value => {
      if (value && value[key]) {
        delete value[key];
      }
      return value;
    });
  },
  delete: async () => {
    await storage.set(null);
  },
  add: async (key, posts, total) => {
    await storage.set(prev => {
      if (!prev[key]) {
        const indexPost: Post[] = posts?.map((item, index) => ({ ...item, index }));
        return {
          ...prev,
          [key]: {
            posts: indexPost,
            meta: {
              total,
            },
          },
        };
      }

      const newPosts = posts?.filter(post => !prev[key]?.posts?.some(p => p?.id === post?.id));

      const resultPosts = [...prev[key].posts, ...newPosts].map((post, index) => ({
        ...post,
        index,
      }));
      return {
        ...prev,
        [key]: {
          posts: resultPosts,
          meta: {
            total,
          },
        },
      };
    });
  },
};

export default postsStorage;
