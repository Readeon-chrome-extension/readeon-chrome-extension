/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import '@pages/popup/Popup.css';

import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import withSuspense from '@src/shared/hoc/withSuspense';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import Header, { openOrFocusTab, patreonUrl, webURL } from './components/Header';

import { useState, useEffect } from 'react';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import extEnableStorage from '@root/src/shared/storages/extEnableStorage';
import { restrictedKeywords } from '@root/src/shared/utils/posts';
import isEnableStorage from '@root/src/shared/storages/isEnableStorage';
import userDataStorage from '@root/src/shared/storages/user/user-storage';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const extEnabled = useStorage(extEnableStorage);
  const matcher = useStorage(matcherStorage);
  const userData = useStorage(userDataStorage);

  const [currentUrl, setCurrentUrl] = useState<string>();
  const [showOverlayBtn, setShowOverlayBtn] = useState<boolean>(true);

  const handleClick = async (type: 'report' | 'feedback' | 'chapter-view') => {
    chrome?.tabs?.query({ currentWindow: true, active: true }, function (tabs) {
      const activeTab = tabs[0];
      const message =
        type === 'feedback' ? 'feedback_modal' : type === 'chapter-view' ? 'overlay-creator-view' : 'report_modal';
      chrome?.tabs?.sendMessage(activeTab?.id, { message });
    });
  };

  const handleRefresh = async () => {
    await chrome.tabs.reload();
  };
  useEffect(() => {
    if (currentUrl?.length) {
      const isRes = isRestrictedPageHandle(currentUrl);
      setShowOverlayBtn(!isRes);
    }
  }, [currentUrl]);

  const isRestrictedPageHandle = (currentUrl: string) => {
    const currentPath = currentUrl?.split(/[?#]/)[0];
    const pathParts = currentPath.split('/');

    const lastPart = pathParts[pathParts.length - 1].toLowerCase();
    return restrictedKeywords.includes(lastPart) || currentPath?.includes('messages');
  };
  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, tanInfo => {
      const tab = tanInfo[0];
      setCurrentUrl(tab?.url);
    });

    chrome.runtime.onMessage.addListener(req => {
      if (req.action === 'current_url') {
        setCurrentUrl(req.data);
      }
    });
  }, []);

  const handleEnableClick = () => {
    isEnableStorage.toggle().then();
  };
  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#000',
        height: '100%',
      }}>
      <Header />

      <div className="flex flex-col justify-center" style={{ height: '75%' }}>
        <div className={`flex w-full justify-center w-full flex-col items-center`}>
          <img
            style={{ margin: '8px 0' }}
            src={theme === 'light' ? '../../../logo-dark.png' : '../../../logo-white.png'}
            height={80}
            width={80}
            alt="logo"
          />
        </div>

        {extEnabled && (
          <>
            {currentUrl?.startsWith(patreonUrl) && userData?.isLoggedIn && (
              <p className="text-sm font-bold text-center">Readeon is currently running on your Patreon tab.</p>
            )}
            {!currentUrl?.startsWith(patreonUrl) && (
              <p className="text-sm font-bold text-center">Please proceed to Patreon to use Readeon.</p>
            )}
          </>
        )}
        {!currentUrl?.startsWith(patreonUrl) && extEnabled && (
          <>
            <div className="text-center w-full mt-2">
              <button
                className="exe-pop-up-btn"
                id="patreon-chapter-view-btn-2"
                onClick={() => openOrFocusTab(patreonUrl, patreonUrl)}
                style={{ padding: '0 12px', width: 'fit-content', fontSize: '12px' }}>
                Click here to go to Patreon
              </button>
            </div>
          </>
        )}

        <>
          {currentUrl?.startsWith(patreonUrl) && extEnabled && userData?.isLoggedIn && (
            <>
              <div className="flex flex-col  justify-center gap-4 mt-4">
                {/* ToDO: will update this once do the monitoring */}

                <div className="flex  justify-center gap-4" style={{ flexWrap: 'wrap' }}>
                  <button
                    className="exe-pop-up-btn"
                    id="patreon-chapter-view-btn-1"
                    onClick={() => openOrFocusTab(`${webURL}/faq`, webURL)}
                    style={{ padding: 0, width: '195px', fontSize: '12px' }}>
                    How To Use Extension?
                  </button>

                  <button
                    className="exe-pop-up-btn"
                    id="patreon-report-btn"
                    onClick={() => handleClick('report')}
                    style={{ padding: 0, width: '195px', fontSize: '12px' }}>
                    Report Readeon Problem
                  </button>
                </div>
                <div className="flex  justify-center gap-4" style={{ flexWrap: 'wrap' }}>
                  <button
                    className="exe-pop-up-btn"
                    id="patreon-feedback-btn"
                    onClick={() => handleClick('feedback')}
                    style={{ padding: 0, width: '195px', fontSize: '12px' }}>
                    Give Readeon Feedback
                  </button>
                  <button
                    className="exe-pop-up-btn"
                    id="patreon-report-btn"
                    onClick={handleRefresh}
                    style={{ padding: 0, width: '195px', fontSize: '12px' }}>
                    Readeon Issue? Click to Refresh
                  </button>
                  <button
                    className="exe-pop-up-btn"
                    id="patreon-report-btn"
                    onClick={() => openOrFocusTab(`${patreonUrl}/DemocraticDeveloper`, patreonUrl)}
                    style={{ padding: 0, width: '195px', fontSize: '12px' }}>
                    Support Readeon
                  </button>
                  {(matcher === 'creatorPost' || matcher === 'posts') && showOverlayBtn && (
                    <>
                      <button
                        className="exe-pop-up-btn"
                        id="patreon-chapter-view-btn"
                        onClick={() => handleClick('chapter-view')}
                        style={{ padding: 0, width: '195px', fontSize: '12px' }}>
                        Open Readeon Overlay
                      </button>
                    </>
                  )}
                  {((matcher === 'creatorPost' || matcher === 'posts') && showOverlayBtn) ||
                  currentUrl === 'https://www.patreon.com/home' ? (
                    <button
                      className="exe-pop-up-btn"
                      id="patreon-chapter-view-btn"
                      onClick={handleEnableClick}
                      style={{ padding: 0, width: '195px', fontSize: '12px' }}>
                      Readeon View
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </>
        {!userData?.isLoggedIn && currentUrl?.startsWith(patreonUrl) && extEnabled && (
          <p className="text-sm font-bold text-center">Sign in to Patreon to use this extension</p>
        )}
        {!extEnabled && (
          <p className="text-sm font-bold text-center ">
            To use Readeon please turn on the extension by clicking on the settings icon in the top right corner and
            then toggling the “Extension” toggle to on.
          </p>
        )}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
