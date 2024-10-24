/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import useStorage from '@root/src/shared/hooks/useStorage';
import themeStorage from '@root/src/shared/storages/themeStorage';
import PostsView from '../posts-view/PostsView';
import React from 'react';
import { X } from 'lucide-react';
import ReactModal from 'react-modal';
import isEnableStorage from '@root/src/shared/storages/isEnableStorage';
import WarningContainer from '@root/src/shared/components/full-screen/warningContainer';
import creatorProfileStorage from '@root/src/shared/storages/creatorProfileStorage';
import CreatorProfile from '@root/src/shared/components/full-screen/creator-profile';
import { Modal } from '@root/src/shared/components/modal/Modal';
import { getKey, getPostKeyByUrl } from '@root/src/shared/utils/posts';
import matcherStorage from '@root/src/shared/storages/matcherStorage';

const OverlayCreator = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const creatorProfileData = useStorage(creatorProfileStorage);
  const matcher = useStorage(matcherStorage);
  const [openTipModal, setOpenTipModal] = React.useState<boolean>(false);
  let buttonClick = 0;
  const startTime = Date.now();
  const handleOpen = async () => {
    try {
      buttonClick++;
      const isEnable = await isEnableStorage.get();

      setIsOpen(true);
      if (!isEnable) await isEnableStorage?.toggle();
    } catch (error) {
      if (buttonClick >= 2 && Date.now() - startTime > 5000) {
        setOpenTipModal(true);
      }
    }
  };
  const creatorProfile = React.useMemo(() => {
    const key = matcher === 'creatorPost' ? getKey(window?.location?.href) : getPostKeyByUrl(window?.location?.href);
    if (creatorProfileData) {
      return creatorProfileData[key];
    }
  }, [creatorProfileData]);
  const handleChromeMessage = (request: any) => {
    if (request?.message === 'overlay-creator-view') {
      handleOpen();
    }
  };
  const handleMessageEvent = event => {
    if (event?.data?.type === 'open-tip-modal') {
      setOpenTipModal(true);
    }
    if (event.data.type === 'Open_Readeon_Overlay') {
      handleOpen();
    }
  };
  React.useEffect(() => {
    chrome?.runtime?.onMessage?.addListener(handleChromeMessage);

    window?.addEventListener('message', handleMessageEvent);
    return () => {
      window?.removeEventListener('message', handleMessageEvent);
      chrome?.runtime?.onMessage?.removeListener(handleChromeMessage);
    };
  }, []);

  const theme = useStorage(themeStorage);
  const customStyles = {
    overlay: {
      zIndex: '1197',
      backgroundColor:
        theme === 'dark'
          ? '#000'
          : theme === 'auto'
            ? 'var(--global-bg-page-default)'
            : 'var(--global-bg-page-default)',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    content: {
      outline: 'none',
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
  } as ReactModal.Styles;
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleTipModalOk = async () => {
    window?.location?.reload();
  };
  return (
    <>
      {isOpen && (
        <ReactModal
          isOpen={isOpen}
          portalClassName="overlay-portal"
          className="overlay-screen"
          style={customStyles}
          onAfterOpen={() => (document.body.style.overflow = 'hidden')}
          onAfterClose={() => (document.body.style.overflow = 'unset')}>
          <div
            className={`full-screen__close`}
            onClick={handleClose}
            data-tooltip-content="Close Post"
            data-tooltip-id="my-tooltip">
            <X size={35} />
          </div>
          <div style={{ width: '80%' }} className="overlay-wrapper">
            <CreatorProfile user={creatorProfile} />
            <WarningContainer text="Overlay will show posts depending on the chosen filters. Exit the overlay to change the filters." />
            <PostsView isView="Overlay" />
          </div>
        </ReactModal>
      )}
      {openTipModal && (
        <Modal
          isOpen={openTipModal}
          title="Tip"
          onClose={() => setOpenTipModal(false)}
          closeIcon
          footer={false}
          body={
            <div style={{ textAlign: 'center' }}>
              <p>Try refreshing the page if a Readeon feature is not working</p>
              <button
                className="bookmark_modal_button"
                style={{ textAlign: 'center', marginTop: '12px' }}
                onClick={handleTipModalOk}>
                Click To Refresh
              </button>
            </div>
          }
        />
      )}
    </>
  );
};
export default OverlayCreator;
