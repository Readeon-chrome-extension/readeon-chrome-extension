/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { FC, useState } from 'react';
import { Post } from '@src/shared/storages/posts/postsStorage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Slide } from 'react-slideshow-image';

interface ImageSlidesProps {
  post: Post;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const ImageSlides: FC<ImageSlidesProps> = ({ post, loading, setLoading }) => {
  const [slideIndex, setSlideIndex] = useState<number>(0);
  return (
    <>
      {post?.image &&
        post?.multipleImages?.length == 1 &&
        !post?.hasLiveStream &&
        !post?.hasVideo &&
        post?.postType !== 'link' &&
        !post?.hadEmbedVideo && (
          <>
            <div className="full-screen__image" style={{ display: 'flex', height: '600px' }}>
              <img
                src={post?.multipleImages[0]?.attributes?.image_urls?.original}
                alt={post?.title}
                style={{ display: loading ? 'none' : 'inline-block', width: '100%', objectFit: 'contain' }}
                onLoad={() => setLoading(false)}
              />
              <span style={{ display: !loading ? 'none' : 'inline-block' }}>Loading Image...</span>
            </div>
          </>
        )}
      {post?.multipleImages?.length > 1 && (
        <div className="slide-container">
          <Slide
            cssClass="each-slide"
            onStartChange={(from, to) => {
              setSlideIndex(to);
            }}
            autoplay={false}
            infinite={false}
            nextArrow={
              <div
                className="image-slide-arrow"
                style={{ display: slideIndex === post?.multipleImages?.length - 1 ? 'none' : 'block' }}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Next">
                <ChevronRight size={30} color="#000000" />
              </div>
            }
            prevArrow={
              <div
                className="image-slide-arrow"
                style={{ display: slideIndex === 0 ? 'none' : 'block' }}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Previous">
                <ChevronLeft color="#000000" size={30} />
              </div>
            }>
            {post?.multipleImages?.map(image => (
              <div key={image.id} style={{ height: '100%', display: 'flex' }}>
                <img
                  src={image?.attributes.image_urls?.original}
                  alt={image?.id}
                  loading="eager"
                  style={{
                    display: loading ? 'none' : 'inline-block',
                    width: '100%',
                    objectFit: 'contain',
                  }}
                  onLoad={() => setLoading(false)}
                />
                <span style={{ display: !loading ? 'none' : 'inline-block', marginBottom: '12px' }}>
                  Loading Image...
                </span>
              </div>
            ))}
          </Slide>
        </div>
      )}
    </>
  );
};
export default ImageSlides;
