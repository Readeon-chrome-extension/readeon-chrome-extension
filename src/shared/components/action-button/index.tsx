/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import useStorage from '@root/src/shared/hooks/useStorage';
import checkboxIdsStorage from '@root/src/shared/storages/checkboxStorage';
import dynamicSelectorStorage from '@root/src/shared/storages/configStorage';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import { Button } from '@src/shared/components/button/Button';
import Select from '@root/src/shared/components/select-component/select';
import { getKey, getPostKeyByUrl } from '@src/shared/utils/posts';
import { CSSProperties, useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import recentPostsStorage from '@src/shared/storages/recent-posts/recentPostsStorage';
import postsStorage, { Post } from '@src/shared/storages/posts/postsStorage';
import { saveAs } from 'file-saver';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import pinnedPostStorage from '@root/src/shared/storages/pinnedPostStorage';
import { toast } from 'sonner';
import {
  extensionTypeOptions,
  generateFinalPostHtml,
  htmlToFormattedText,
} from '@src/shared/components/action-button/utils';
import isEnableStorage from '@root/src/shared/storages/isEnableStorage';

import { Modal } from '@src/shared/components/modal/Modal';
import fileTypeStorage from '@root/src/shared/storages/fileTypePersistStorage';
import downloadFeatureToggleStorage, { getStorageKey } from '@root/src/shared/storages/downloadFeatureToggleStorage';
import ProgressBar from '@src/shared/components/action-button/ProgressBar';
import axios from 'axios';
import { capitalizeFirstChar } from '@root/src/pages/content/ui/bookmark';
import config from '@root/src/config';

type ViewType = 'recent-view' | 'post-view';
type readeonViewType = 'Post' | 'Overlay' | 'Recent';
interface PostSelectionActionType {
  view?: ViewType;
  readeonView?: readeonViewType;
  authorKey?: string;
  showCheckboxes: boolean;
  currentPage?: number;
  setShowCheckboxes: React.Dispatch<React.SetStateAction<boolean>>;
}

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  justify-content: space-between;
`;

// const BASE_URL = 'http://localhost:3000/api';
const BASE_URL = 'https://www.readeon.com/api';

const PostSelectionActionButton: React.FC<PostSelectionActionType> = ({
  view,
  authorKey: viewSpecificAuthorKey,
  showCheckboxes,
  readeonView,
  currentPage,
}) => {
  const fileType = useStorage(fileTypeStorage);
  const hasClicked = useStorage(downloadFeatureToggleStorage);
  const dynamicConfig = useStorage(dynamicSelectorStorage);
  const matcher = useStorage(matcherStorage);
  const selectedIds = useStorage(checkboxIdsStorage);
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const postData = useStorage(matcher === 'recentPosts' ? recentPostsStorage : postsStorage);
  const [allLocked, setAllLocked] = useState<boolean>(false);
  const pinnedPosts = useStorage(pinnedPostStorage);
  const isReadeonView = useStorage(isEnableStorage);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [postContainerParent, setPostContainerParent] = useState([]);
  const authorKey = useMemo(() => {
    if (view === 'recent-view') {
      return viewSpecificAuthorKey;
    } else {
      return matcher === 'creatorPost'
        ? getKey(window?.location?.href)
        : window.location.href.startsWith('https://www.patreon.com/user')
          ? window.location.href
          : getPostKeyByUrl(window?.location?.href);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matcher]);

  const pageSpecificPostsData: Post[] = useMemo(() => {
    if (authorKey && (matcher === 'creatorPost' || matcher === 'posts')) {
      const isPinnedPost = document.querySelector(dynamicConfig?.pinnedPostRootSelector);
      if (isPinnedPost) {
        const post = pinnedPosts?.[authorKey?.toLowerCase()] || [];
        const restPostsData = postData?.[authorKey?.toLowerCase()]?.posts || [];
        const overallPosts = [...post, ...restPostsData];
        // Remove duplicates based on post id
        const uniquePosts = overallPosts.filter((post, index, self) => index === self.findIndex(p => p.id === post.id));
        return uniquePosts || [];
      }
      return postData ? postData[authorKey?.toLowerCase()]?.posts : [];
    } else {
      return postData || [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorKey, postData]);

  const authorName = useMemo(() => {
    if (!pageSpecificPostsData || !pageSpecificPostsData?.length || !authorKey) return;
    return pageSpecificPostsData?.find(post => post.authorKeyLowerCase === authorKey.toLowerCase());
  }, [pageSpecificPostsData, authorKey]);

  const getPostContainer = (startTime: number = Date.now()) => {
    let container;
    if (view === 'recent-view') {
      const authorContainer = document.querySelector(`[data-author-key=${authorKey}]`);
      container = authorContainer?.querySelectorAll(config.pages.posts.readeonPostContainer);
    } else {
      container = document?.querySelectorAll(config.pages.posts.readeonPostContainer);
    }
    // Check if 5 seconds have passed
    if (Date.now() - startTime > 5000) {
      console.log('Stopping execution after 5 seconds');
      return;
    }
    if (!container?.length) {
      setTimeout(() => getPostContainer(startTime), 300);
      return;
    }

    setPostContainerParent(container ?? []);
  };
  useMemo(() => {
    getPostContainer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicConfig, authorKey, currentPage]);

  const handleSelectAllVisiblePosts = async () => {
    const authorContainer = document.querySelector(`[data-author-key=${authorKey}]`);
    const postContainer = authorContainer?.querySelectorAll(config.pages.posts.readeonPostContainer);

    const postElements = [...Array.from(view === 'recent-view' ? postContainer : postContainerParent)];
    if (!postElements?.length) return;

    const allCheckedEle = postElements?.every((el: HTMLInputElement) => el?.checked);
    const postIds = pageSpecificPostsData
      ?.map(post => {
        if (post?.isView) {
          return String(post?.id);
        } else {
          return;
        }
      })
      .filter(id => id !== null && id !== undefined);

    if (indeterminate || allCheckedEle) {
      // Deselect all checkboxes and remove their IDs from the storage
      postElements?.forEach((checkboxElement: HTMLInputElement) => {
        if (checkboxElement) {
          checkboxElement.checked = false;
        }
      });
      setAllChecked(false);
      await checkboxIdsStorage.removeMultiplePostIds(authorKey.toLowerCase());
    } else {
      // Select all checkboxes and add their IDs to the storage
      postElements?.forEach((checkboxElement: HTMLInputElement) => {
        if (checkboxElement) {
          checkboxElement.checked = true;
        }
      });
      await checkboxIdsStorage.addMultiplePostIds(authorKey?.toLowerCase(), postIds);
      setAllChecked(true);
    }
    // setIndeterminate(false);
  };

  const selectedPostContent = () => {
    if (!pageSpecificPostsData?.length) return [];

    const filteredPosts =
      pageSpecificPostsData.filter(
        post =>
          post.authorKeyLowerCase === authorKey?.toLowerCase() &&
          selectedIds[authorKey?.toLowerCase()]?.includes(String(post?.id)),
      ) || [];

    return filteredPosts.slice().reverse();
  };

  const getUnlockedPost = (postContainer: Element[]) => {
    const postElements = [...Array.from(postContainer)];
    const unlockedPosts = postElements
      ?.map(el => {
        const id = el.getAttribute('data-post-id');
        return id;
      })
      ?.filter(id => id !== null && id !== undefined);
    return unlockedPosts;
  };

  useEffect(() => {
    // checking the post status for recent view
    if (pageSpecificPostsData?.length) {
      const selectedPosts = selectedIds[authorKey?.toLowerCase()];
      if (view === 'recent-view') {
        if (selectedPosts?.length) {
          const authorContainer = document.querySelector(`[data-author-key=${authorKey}]`);
          const postEleContainer = authorContainer?.querySelectorAll(config.pages.posts.readeonPostContainer);
          const validPostRecent = getUnlockedPost([...Array.from(postEleContainer)]);

          // Check if all validPostRecent IDs exist in selectedPosts
          const containsAllIds = validPostRecent.every(id => selectedPosts.includes(id));

          // Check if at least one validPostRecent ID exists in selectedPosts
          const containsAnyIds = validPostRecent.some(id => selectedPosts.includes(id));

          // Logic for AllChecked and Indeterminate
          if (containsAllIds) {
            setAllChecked(true);
            setIndeterminate(false); // All are selected, so no indeterminate state
          } else if (containsAnyIds) {
            setAllChecked(false); // Some are selected but not all
            setIndeterminate(true); // Indeterminate state
          } else {
            setAllChecked(false); // None are selected
            setIndeterminate(false); // No indeterminate state
          }
        } else {
          // mark the all checked and Indeterminate post false due to do post selected
          setIndeterminate(false);
          setAllChecked(false);
        }
      }
    }
  }, [selectedIds, authorKey, pageSpecificPostsData]);

  useMemo(() => {
    // checking the post status for post view
    if (view === 'post-view') {
      if (pageSpecificPostsData?.length) {
        const selectedPosts = selectedIds[authorKey?.toLowerCase()];
        if (selectedPosts?.length) {
          const validPost = pageSpecificPostsData?.filter(el => el?.isView);
          const totalPosts = validPost.length;

          const selectedInCurrentBatch = selectedPosts.filter(id =>
            validPost.some(post => String(post.id) === id),
          ).length;
          if (selectedInCurrentBatch === totalPosts && totalPosts > 0) {
            setAllChecked(true);
            setIndeterminate(false);
          } else if (selectedInCurrentBatch > 0 && selectedInCurrentBatch < totalPosts) {
            setAllChecked(false);
            setIndeterminate(true);
          } else {
            setAllChecked(false);
            setIndeterminate(false);
          }
        } else {
          // mark the all checked and Indeterminate post false due to do post selected
          setIndeterminate(false);
          setAllChecked(false);
        }
        //checking if all the rendered post locked or not
        const lockedPost = pageSpecificPostsData?.every(el => !el?.isView);

        setAllLocked(lockedPost);
      }
    }
  }, [selectedIds, pageSpecificPostsData]);

  useMemo(() => {
    //checking if all the rendered post locked or not for recent view
    if (view === 'recent-view' && pageSpecificPostsData?.length) {
      const lockedPost = pageSpecificPostsData
        ?.filter(post => post?.authorKeyLowerCase === authorKey?.toLowerCase())
        ?.every(el => !el?.isView);

      setAllLocked(lockedPost);
    }
  }, [authorKey]);

  const resetData = () => {
    setAllChecked(false);
    setIndeterminate(false);

    downloadFeatureToggleStorage.setHasClicked(authorKey?.toLowerCase(), view, false).then();
    if (!postContainerParent?.length) return;

    const postElements = [...Array.from(postContainerParent)];
    postElements?.forEach((checkboxElement: HTMLInputElement) => {
      if (checkboxElement) {
        checkboxElement.checked = false;
      }
    });
  };

  const simulateProgress = (fileSize: number, step: number) => {
    return new Promise<void>(resolve => {
      let loaded = 0;
      const interval = setInterval(() => {
        loaded += step;
        setProgress((loaded / fileSize) * 100);

        if (loaded >= fileSize) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const generateDocx = async (type: string) => {
    try {
      const postContent = selectedPostContent();

      const blob = new Blob([generateFinalPostHtml(postContent || [], 'doc')], {
        type:
          type === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword',
      });

      setShowProgress(true);
      setProgress(0);
      const fileName = `${matcher.toLowerCase()}-${authorKey?.toLowerCase() || 'author-name'}.${type}`;
      const fileSize = blob.size;
      const step = fileSize / 10;
      await simulateProgress(fileSize, step);
      saveAs(blob, fileName);
      await updateDownloadFeatureUsedCounter();
      resetData();
      await checkboxIdsStorage.removeMultiplePostIds(authorKey?.toLowerCase());
      setShowProgress(false);
      setIsModalOpen(true);
    } catch (error) {
      await checkboxIdsStorage.removeMultiplePostIds(authorKey?.toLowerCase());
      resetData();
      setShowProgress(false);
      setProgress(0);
    }
  };

  const downloadText = async (type: string) => {
    try {
      const posts = selectedPostContent() || [];
      const htmlContent = generateFinalPostHtml(posts, 'text');
      const cleanTextContent = htmlToFormattedText(htmlContent);
      const blob = new Blob([cleanTextContent], { type: 'text/plain' });

      setShowProgress(true);
      setProgress(0);
      const fileSize = blob.size;
      const fileName = `${matcher.toLowerCase()}-${authorKey?.toLowerCase() || 'author-name'}.${type}`;
      const step = fileSize / 10;
      await simulateProgress(fileSize, step);
      saveAs(blob, fileName);
      resetData();
      await updateDownloadFeatureUsedCounter();
      await checkboxIdsStorage.removeMultiplePostIds(authorKey?.toLowerCase());
      setShowProgress(false);
      setIsModalOpen(true);
    } catch (error) {
      resetData();
      setShowProgress(false);
      setProgress(0);
    }
  };

  const downloadEpubFile = async (type: string) => {
    let simulatedProgressInterval;
    const posts = selectedPostContent();
    try {
      if (!posts?.length) throw Error;

      setShowProgress(true);
      setProgress(0);

      simulatedProgressInterval = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + 5 : prev));
      }, 900);

      const response = await axios.post(
        `https://diplomatic-adelina-readeon-f63fb2a8.koyeb.app/api/download/epub`,
        {
          data: posts || [],
          title: `${capitalizeFirstChar(matcher.toLowerCase())}-Content`,
          author: capitalizeFirstChar(authorKey?.toLowerCase() || 'Unknown'),
        },
        {
          responseType: 'blob',
        },
      );

      if (response.status === 400) {
        toast.error('Downloads are limited to 500 MB. Please de-select some posts.');
      }

      const blob = new Blob([response.data], { type: 'application/epub+zip' });

      const fileName = `${matcher.toLowerCase()}-${authorKey?.toLowerCase() || 'author-name'}.${type}`;
      saveAs(blob, fileName);
      resetData();
      setIsModalOpen(true);
      await updateDownloadFeatureUsedCounter();
      await checkboxIdsStorage.removeMultiplePostIds(authorKey?.toLowerCase());
      clearInterval(simulatedProgressInterval);
      setProgress(100);
      setShowProgress(false);
    } catch (error) {
      await checkboxIdsStorage.removeMultiplePostIds(authorKey?.toLowerCase());
      resetData();
      toast.error('Something went wrong.');
      if (simulatedProgressInterval) clearInterval(simulatedProgressInterval);
      setShowProgress(false);
      setProgress(0);
    }
  };

  useMemo(() => {
    const isToasterExist = document.querySelector('li[aria-live="polite"]');
    if (allChecked && view === 'post-view' && readeonView === 'Post' && !isToasterExist) {
      toast.success('All unlocked posts loaded on the page have been selected', {
        position: 'bottom-right',
        richColors: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);

  const handleDownload = () => {
    if (!selectedPostContent()?.length) {
      return;
    }
    if (!fileType.length) {
      toast.warning('Please select file extension to download!', { position: 'bottom-right', richColors: true });
    }

    switch (fileType) {
      case 'doc':
      case 'docx':
        generateDocx(fileType);

        break;
      case 'txt':
        downloadText(fileType);
        break;
      case 'epub':
        downloadEpubFile(fileType);
        break;
      default:
        break;
    }
  };

  const baseStyles = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  };

  const selectAllCheckboxTextStyles = {
    textDecoration: 'underline',
    cursor: 'pointer',
  } as CSSProperties;

  const combinedStyles = isReadeonView ? { ...baseStyles, ...selectAllCheckboxTextStyles } : baseStyles;

  const handleTextLinkClick = () => {
    if (isReadeonView) {
      downloadFeatureToggleStorage
        .setHasClicked(authorKey?.toLowerCase(), view, !hasClicked[getStorageKey(authorKey?.toLowerCase(), view)])
        .then();
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const isHasClicked = hasClicked[getStorageKey(authorKey?.toLowerCase(), view)];
  const updateDownloadFeatureUsedCounter = async () => {
    try {
      await axios.post(`${BASE_URL}/download-counter`);
    } catch (error) {
      console.log('error', { error });
    }
  };
  const isInValidAuthor = useMemo(() => !window?.location?.href.startsWith('https://www.patreon.com/user'), []);
  return (
    <>
      <FlexContainer>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}>
          {(isReadeonView && isHasClicked) || !isReadeonView || showCheckboxes ? (
            <div style={{ display: 'flex' }}>
              <input
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: allLocked ? 'default' : 'pointer',
                  opacity: allLocked ? 0.8 : 1,
                }}
                type="checkbox"
                checked={allChecked}
                ref={el => el && (el.indeterminate = indeterminate)}
                onChange={handleSelectAllVisiblePosts}
                disabled={allLocked}
                data-tooltip-id="all-post-selection"
                data-tooltip-content={
                  isInValidAuthor
                    ? 'Readeon cannot download posts for this creator due to Patreon restrictions.'
                    : allLocked
                      ? 'All currently loaded posts on the page are locked and cannot be selected.'
                      : ''
                }
              />
            </div>
          ) : null}
          <span
            style={combinedStyles}
            data-tooltip-id="select-text-tooltip"
            onClick={() => handleTextLinkClick()}
            data-tooltip-content={
              (isHasClicked || showCheckboxes) && isReadeonView ? 'Click to turn off Download feature' : ''
            }>
            {isHasClicked || showCheckboxes
              ? view === 'recent-view'
                ? `Select Posts to Download from ${authorName?.user?.attributes?.name || ''}`
                : 'Select Posts to Download'
              : isReadeonView
                ? view === 'recent-view'
                  ? `Click to Download Posts from ${authorName?.user?.attributes?.name || ''}`
                  : 'Click here to Download Posts'
                : view === 'recent-view'
                  ? `Select Posts to Download from ${authorName?.user?.attributes?.name || ''}`
                  : 'Select Posts to Download'}
          </span>
        </div>
        {(allChecked || indeterminate) && (isHasClicked || showCheckboxes) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Select
              defaultValue={fileType}
              options={extensionTypeOptions}
              onChange={value => fileTypeStorage.setExtensionType(String(value))}
              placeholder="File type"
              style={{ width: 'fit-content', paddingRight: '30px', lineHeight: 1.5 }}
            />
            <Button text="Download" onClick={handleDownload} />
          </div>
        )}
        <ReactTooltip
          id={`select-text-tooltip`}
          place="bottom-start"
          style={{ width: 'fit-content', backgroundColor: '#000', zIndex: 100, textAlign: 'center' }}
          opacity={1}
        />
        <ReactTooltip
          id={`all-post-selection`}
          place="bottom-start"
          style={{ width: '300px', backgroundColor: '#000', zIndex: 100, textAlign: 'center' }}
          opacity={1}
        />
      </FlexContainer>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title="Download Successful"
          onClose={handleClose}
          footer={false}
          body={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ textAlign: 'center' }}>
                Posts have been downloaded successfully.{' '}
                <a
                  style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  href="https://www.amazon.com/sendtokindle"
                  target="_blank"
                  rel="noreferrer">
                  Click here
                </a>{' '}
                to send the file to your Kindle.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="button" className="bookmark_modal_button" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          }
        />
      )}

      {showProgress && <ProgressBar percentage={progress} fileType={fileType} />}
    </>
  );
};

export default PostSelectionActionButton;
