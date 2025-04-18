/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import config from '@src/config';
import ImageSlides from '@src/shared/components/full-screen/ImageSlide';
import UpgradeIcon from '@src/shared/components/full-screen/upgradeIcon';
import {
  handleScrollUp,
  movePollForAuthor,
  pauseAudioFile,
  pauseVideoFile,
  pollsForRecentView,
  restoreAttachmentsAuthorView,
  restoreAudio,
  restoreAudioRecentView,
  restoreComments,
  restoreCommentsRecentView,
  restorePollsAuthorView,
  restorePollsRecentView,
  restorePostActionsAuthorView,
  restorePostActionsRecentView,
  restoreVideo,
  restoreVideoRecentView,
} from '@src/shared/components/full-screen/utils';
import useStorage from '@src/shared/hooks/useStorage';
import postsIsLoadingStorage from '@src/shared/storages/posts/postsIsLoadingStorage';
import { Post } from '@src/shared/storages/posts/postsStorage';
import { CircleArrowUp, PencilIcon, Settings, X } from 'lucide-react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import LoadingOverlay from 'react-loading-overlay-ts';
import ReactModal from 'react-modal';
import { usePopper } from 'react-popper';
import { Tooltip } from 'react-tooltip';
import { toast } from 'sonner';
import dynamicSelectorStorage from '../../storages/configStorage';
import themeStorage from '../../storages/themeStorage';
import AudioVideo from './audio-video';
import Navigation from './navigation';
import PostIcons from './posts-icons';
import WarningContainer from './warningContainer';
import CreatorProfile from './creator-profile';
import TextSettings from './text-settings';
import textStylingStorage from '../../storages/textStylingStorage';

export interface FullScreenProps {
  isRecentView: boolean;
  isOpen: boolean;
  postData: Post;
  showComments?: boolean;
  showNavigation?: boolean;
  allowPrevious?: boolean;
  allowNext?: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showBookMarkIcon?: boolean;
  showActionItem?: boolean;
  isLatestPost?: boolean;
  navigationTooltip?: string;
  loadingTip?: string;
}

const FullScreen: FC<FullScreenProps> = ({
  isOpen,
  isRecentView,
  postData,
  allowNext,
  allowPrevious,
  showNavigation,
  onClose,
  onNext,
  onPrevious,
  showActionItem = true,
  isLatestPost = false,
  navigationTooltip,
  loadingTip,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [selection, setSelection] = useState<string>();
  const isLoading = useStorage(postsIsLoadingStorage);
  const dynamicConfig = useStorage(dynamicSelectorStorage);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top',
  });
  const popperRef = useRef<HTMLDivElement | null>(null);
  const theme = useStorage(themeStorage);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactModalRef = useRef<HTMLElement | null>(null);
  const textStyles = useStorage(textStylingStorage);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const backColor =
    theme === 'dark' ? '#000' : theme === 'auto' ? 'var(--global-bg-page-default)' : 'var(--global-bg-page-default)';

  const customStyles = {
    overlay: {
      zIndex: '20000',
      backgroundColor: textStyles?.backgroundColor,
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      // alignSelf: 'center',
      outline: 'none',
      margin: '0 auto',
      width: '100%',
      height: '100%',
    },
  } as ReactModal.Styles;

  useEffect(() => {
    // textStylingStorage.add({...textStyles,backgroundColor:backColor})
  }, [backColor]);

  useEffect(() => {
    if (!postData) {
      return;
    }
    setPost(postData);
  }, [postData]);
  // showing the poll details
  useEffect(() => {
    if (!post?.isPoll || !isOpen) {
      return;
    }

    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (post?.isPoll && mutation.type === 'childList' && document.querySelector('.full-screen__poll')) {
          isRecentView
            ? pollsForRecentView(post?.authorKey, post?.index)
            : movePollForAuthor(post?.index, post?.isPinnedPost, dynamicConfig);
          observer.disconnect();
          break;
        }
      }
    });
    isRecentView
      ? pollsForRecentView(post?.authorKey, post?.index)
      : movePollForAuthor(post?.index, post?.isPinnedPost, dynamicConfig);
    observer.observe(document.body, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.isPoll, post?.index, isOpen]);

  //handling the toggle feature of comment button
  const toggleComment = useCallback((ev: any) => {
    ev.stopPropagation();
    ev.preventDefault();
    setShowComments((prev: boolean) => !prev);
  }, []);
  useEffect(() => {
    handleShowComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //* this function is for getting selected text...

  const handleTextSelection = () => {
    const selectedText = window && window.getSelection().toString();
    if (selectedText.trim().length > 0) {
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const referenceDiv = document.createElement('div');
      referenceDiv.style.position = 'absolute';
      referenceDiv.style.top = `${rect.top + window.scrollY - 10}px`;
      referenceDiv.style.left = `${rect.left + window.scrollX}px`;
      referenceDiv.style.height = `${rect.height}px`;
      referenceDiv.style.width = `${rect.width}px`;
      document.body.appendChild(referenceDiv);

      setSelection(selectedText);
      setReferenceElement(referenceDiv);
    } else {
      setSelection(null);
      setReferenceElement(null);
    }
  };

  //* this function is used to handle the deselection of selected text when clicking outside or on the selected text

  const handleClickOutside = event => {
    const commentsContainer = document.querySelector('.full-screen__comments-content');
    if (
      popperRef.current &&
      !popperRef.current.contains(event.target) &&
      (!commentsContainer || !commentsContainer.contains(event.target))
    ) {
      setSelection('');
      window.getSelection().removeAllRanges();
    }
  };

  let contentElement;

  const handleSelectAll = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (!isInputFocused && (event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      event.stopPropagation();
      selectContent();
    }
  };

  const selectContent = () => {
    const contentElement = document.getElementById('fullscreen-content-selection');
    if (contentElement) {
      const range = document.createRange();
      range.selectNodeContents(contentElement);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const fullScreenContentSelection = () => {
    contentElement = document.querySelector('.full-screen__content');

    if (!contentElement) {
      setTimeout(() => fullScreenContentSelection(), 300);
      return;
    }
    contentElement?.addEventListener('mouseup', handleTextSelection);
    document?.addEventListener('mousedown', handleClickOutside);
  };
  //* this effect clears the selected text when clicked event is fired on selected text

  useEffect(() => {
    if (isOpen && post?.userCanComment && showActionItem) {
      fullScreenContentSelection();
    }
    document.addEventListener('keydown', handleSelectAll);
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('mouseup', handleTextSelection);
        document.removeEventListener('mousedown', handleClickOutside);
      }
      document.removeEventListener('keydown', handleSelectAll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, post]);

  const clearTextArea = () => {
    const commentsContainer = document?.querySelector('.full-screen__comments-content');
    const commentInput = commentsContainer?.querySelector('textarea');
    if (commentInput) {
      commentInput.value = '';
      commentInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleSuggestEditsClick = () => {
    if (selection) {
      setShowComments(true);
      setTimeout(() => {
        const commentsContainer = document.querySelector('.full-screen__comments-content');
        commentsContainer.scrollIntoView({ behavior: 'smooth' });
        if (commentsContainer) {
          const commentInput = commentsContainer.querySelector('textarea');
          if (commentInput) {
            commentInput.value = `Edit Suggestions:\n   - Original Text: ${selection} \n   - Suggested Text: ${selection} `;
            commentInput.dispatchEvent(new Event('input', { bubbles: true }));
            commentInput.focus();
            setSelection(null);
          }
        }
      }, 0);
    }
  };

  const getCommentButton = () => {
    const rootElement = document?.querySelector('.full-screen__post-details-actions');
    if (!rootElement) {
      return;
    }
    const commentIcon = rootElement?.querySelector(config?.pages?.posts?.showCommentSelector);
    commentIcon?.removeEventListener('click', toggleComment);

    return commentIcon;
  };
  const handleShowComments = () => {
    const commentIcon = getCommentButton();

    if (!commentIcon) {
      setTimeout(() => handleShowComments(), 600);
      return;
    }
    commentIcon?.addEventListener('click', toggleComment);
  };
  const restorePostDetails = () => {
    post?.hasAudio && pauseAudioFile();
    post?.hasVideo && pauseVideoFile();
    if (isRecentView) {
      post?.isPoll && restorePollsRecentView(post.authorKey, post?.index);
      post?.hasAudio && restoreAudioRecentView(post?.authorKey, post?.index);
      (post?.hasVideo || post?.hasLink) && restoreVideoRecentView(post?.authorKey, post?.index, post?.hasLink);
      restorePostActionsRecentView(post?.authorKey, post?.index, post?.isView);
      restoreCommentsRecentView(post?.authorKey, post?.index);
    } else {
      restorePollsAuthorView(post?.index, post?.isPinnedPost, dynamicConfig);
      restoreAudio(post?.index, post?.isPinnedPost, dynamicConfig);
      (post?.hasVideo || post?.hasLink) && restoreVideo(post?.index, post?.isPinnedPost, dynamicConfig, post.hasLink);
      restoreAttachmentsAuthorView(post?.index, post?.isPinnedPost, dynamicConfig);
      restorePostActionsAuthorView(
        post?.index,
        post?.isPoll,
        post?.isView,
        post?.hasTags,
        post?.isPinnedPost,
        dynamicConfig,
      );
      restoreComments(post?.index, post?.isPinnedPost, dynamicConfig);
    }
  };
  const handleClose = () => {
    clearTextArea();
    const commentIcon = getCommentButton();
    commentIcon?.removeEventListener('click', toggleComment);
    restorePostDetails();
    setPost(null);
    onClose();
  };

  const handleNext = useCallback(() => {
    clearTextArea();
    const commentIcon = getCommentButton();
    commentIcon?.removeEventListener('click', toggleComment);
    if (allowNext) {
      restorePostDetails();
      const overlay = document.querySelector('.full-screen').parentNode as HTMLElement;
      overlay.scrollTop = 0;
      setPost(null);
      onNext();
      setTimeout(() => {
        handleShowComments();
      }, 300);
      setLoading(true);
      setShowComments(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowNext, isRecentView, onNext, post]);

  const handlePrevious = useCallback(() => {
    clearTextArea();
    const commentIcon = getCommentButton();
    commentIcon?.removeEventListener('click', toggleComment);
    if (allowPrevious) {
      restorePostDetails();
      setLoading(true);
      const overlay = document.querySelector('.full-screen').parentNode as HTMLElement;
      overlay.scrollTop = 0;
      setPost(null);
      onPrevious();
      setTimeout(() => {
        handleShowComments();
      }, 300);

      setShowComments(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowPrevious, isRecentView, onPrevious, post]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && !isLoading) {
        if (!allowNext && !isLoading) {
          toast.info('Posts Are Either Loading or Have Finished', { position: 'bottom-right', duration: 1000 });
        } else {
          handleNext();
        }
      } else if (event.key === 'ArrowLeft') {
        if (!allowPrevious) {
          toast.info('Posts Are Either Loading or Have Finished', { position: 'bottom-left', duration: 1000 });
        } else {
          handlePrevious();
        }
      }
    },
    [handleNext, handlePrevious, allowNext, allowPrevious, isLoading],
  );

  const postCommentHandler = async () => {
    const linkText = ' \n** I read this post using Readeon: www.readeon.com **';
    setTimeout(() => {
      const commentsContainer = document.querySelector('.full-screen__comments-content');
      const lastComment = commentsContainer.querySelector(
        '[data-tag="content-card-comment-thread-container"] > div > div:nth-child(1)',
      );
      const ele = lastComment.querySelector('[data-tag="comment-body"] > p > span');

      if (!ele?.textContent?.includes(linkText)) {
        ele.textContent += linkText;
      }
    }, 2000);
  };

  useEffect(() => {
    if (showNavigation && !isLatestPost) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (showNavigation) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);

  const postComment = useCallback(postCommentHandler, []);

  useEffect(() => {
    // Adding the observer to check the comments post button is exist or not
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation?.type === 'childList') {
          const commentsContainer = document.querySelector('.full-screen__comments-content');
          if (commentsContainer) {
            const postButton = [...commentsContainer.querySelectorAll('button')].find(
              ele => ele?.textContent === config.pages.post.commentPost,
            );
            if (postButton) {
              postButton.removeEventListener('click', postComment);
              postButton.addEventListener('click', postComment);
              observer.disconnect();
              break;
            }
          }
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true });
    return () => {
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  //* this below useEffect is used to track the interactiveness of user in fullscreen mode

  const resetInactivityTimeout = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsInteractive(true);
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsInteractive(false);
    }, 3000);
  };

  useEffect(() => {
    const getReactModalElement = () => {
      const element = document?.querySelector('.full-screen-active');
      if (element) {
        reactModalRef.current = element as HTMLElement;
        element.addEventListener('mousemove', resetInactivityTimeout);
        // element.addEventListener('scroll', resetInactivityTimeout);
        // element.addEventListener('wheel', resetInactivityTimeout);
        element.addEventListener('click', resetInactivityTimeout);
      } else {
        setTimeout(getReactModalElement, 300);
      }
    };

    getReactModalElement();

    // Initial check to hide the buttons after 2.5 seconds if no interaction
    if (inactivityTimeoutRef?.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsInteractive(false);
    }, 3000);

    return () => {
      if (reactModalRef?.current) {
        reactModalRef.current.removeEventListener('mousemove', resetInactivityTimeout);

        reactModalRef.current.removeEventListener('click', resetInactivityTimeout);
      }
    };
  }, []);

  return (
    <>
      <ReactModal
        isOpen={isOpen}
        className="full-screen full-screen-active"
        style={customStyles}
        onAfterOpen={() => {
          document.body.style.overflow = 'hidden';
        }}
        onAfterClose={() => (document.body.style.overflow = 'unset')}
        preventScroll
        id="scroll-up"
        parentSelector={() => document.querySelector('#renderPageContentWrapper')}>
        <div
          className={`full-screen__close ${isInteractive ? 'interaction-visible' : 'interaction-hidden'}`}
          onClick={handleClose}
          data-tooltip-content="Close Post"
          data-tooltip-id="my-tooltip">
          <X size={35} />
        </div>

        {postData ? (
          <LoadingOverlay
            active={isLoading}
            text={
              <>
                <span style={{ display: 'block' }}>
                  While posts are loading, other Readeon buttons may not be clickable. Refresh the page if you must.
                </span>
                <br />
                {loadingTip}
              </>
            }
            spinner={isLoading}
            styles={{
              wrapper: base => ({
                ...base,
                pointerEvents: isLoading ? 'none' : 'all',
              }),
            }}>
            {showNavigation && (
              <Navigation
                allowNext={allowNext}
                allowPrevious={allowPrevious}
                isRecentView={isRecentView}
                isInteractive={isInteractive}
                isLoading={isLoading}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                isLatestPost={isLatestPost}
                navigationTooltip={navigationTooltip}
              />
            )}

            <div
              className={`chapter-content`}
              style={{
                fontFamily: textStyles?.fontFamily,
                maxWidth: textStyles?.contentWidth,
                color: textStyles?.textColor,
              }}>
              {isRecentView && <CreatorProfile user={postData?.user} textStyles={textStyles} />}

              <div style={{ width: '100%', marginTop: '12px', textAlign: 'center' }}>
                <button
                  style={{ border: '1px solid var(--global-bg-page-default)', outline: 'none' }}
                  onClick={() => setIsModalOpen(true)}
                  className="bookmark_modal_button">
                  <Settings size={20} style={{ cursor: 'pointer', marginRight: '6px' }} /> Reader Preferences
                </button>{' '}
              </div>
              <div className="full-screen__container" id="fullscreen-content-selection">
                <div className="full-screen__header">
                  <div className={`full-screen__container`}>
                    <h1
                      style={{
                        marginBottom: '0px',
                        textAlign: textStyles?.textAlign,
                      }}
                      className={`${textStyles?.fontSize}`}>
                      <a href={post?.patreon_url ?? post?.url} style={{ color: 'currentcolor' }}>
                        {post?.title}
                      </a>
                    </h1>
                  </div>
                </div>

                <AudioVideo post={postData} isOpen={isOpen} isRecentView={isRecentView} dynamicConfig={dynamicConfig} />

                <div className="full-screen__container" style={{ display: post?.hasAudio ? 'none' : 'block' }}>
                  <ImageSlides post={post} loading={loading} setLoading={setLoading} />
                </div>
                <div
                  className={`${textStyles?.fontSize} ${textStyles?.spacingClass} ${textStyles?.lineHeightSpacing} full-screen__content full-screen__container`}
                  style={{ textAlign: textStyles?.textAlign }}
                  dangerouslySetInnerHTML={{ __html: post?.content }}
                />
              </div>
              {!post?.isView && post?.isView !== undefined && (
                <div className="full-screen__container upgrade-button">
                  <a href={post?.upgrade_url ?? '#'} className="upgrade-link">
                    <div className="inner-container">
                      <div className="lock-icon">
                        <UpgradeIcon />
                      </div>
                      <div className="upgrade-text">Upgrade to unlock</div>
                    </div>
                  </a>
                </div>
              )}

              <div className="full-screen__attachments full-screen__container"></div>
              {post?.isPoll && <div className="full-screen__poll full-screen__container" />}

              <PostIcons
                showActionItem={showActionItem}
                showComments={showComments}
                isOpen={isOpen}
                isRecentView={isRecentView}
                dynamicConfig={dynamicConfig}
                post={post}
              />

              <Tooltip id="my-tooltip" place="top" style={{ backgroundColor: '#000' }} />
              {selection && (
                <div
                  ref={el => {
                    setPopperElement(el);
                    popperRef.current = el;
                  }}
                  style={{ ...styles.popper, display: 'flex' }}
                  {...attributes.popper}>
                  <button
                    className="bookmark_modal_button"
                    onClick={() => handleSuggestEditsClick()}
                    style={{
                      zIndex: 1500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0px 6px 24px 0px rgba(0,0,0,0.14)',
                    }}>
                    Suggest Edits
                    <PencilIcon size={16} style={{ top: '-2px', position: 'relative' }} />
                  </button>
                </div>
              )}
            </div>
            <span className={`full_screen_arrow_up ${isInteractive ? 'interaction-visible' : 'interaction-hidden'}`}>
              <div
                onClick={handleScrollUp}
                style={{ backgroundColor: 'var(--global-bg-page-default)', borderRadius: '100%' }}>
                <CircleArrowUp />
              </div>
            </span>
          </LoadingOverlay>
        ) : (
          <WarningContainer text="Readeon was not able to get post details. Please exit this full screen, scroll all the way down the page, and then scroll back up and try using the Full Screen button again." />
        )}
      </ReactModal>
      {isModalOpen && (
        <TextSettings textStyles={textStyles} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};
export default FullScreen;
