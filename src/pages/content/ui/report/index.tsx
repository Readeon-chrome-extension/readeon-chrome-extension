/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import styled from '@emotion/styled';
import { Button } from '@root/src/shared/components/button/Button';
import { Modal } from '@root/src/shared/components/modal/Modal';
import Select, { OptionsType } from '@root/src/shared/components/select-component/select';
import useStorage from '@root/src/shared/hooks/useStorage';
import extEnableStorage from '@root/src/shared/storages/extEnableStorage';
import isEnableStorage from '@root/src/shared/storages/isEnableStorage';
import matcherStorage from '@root/src/shared/storages/matcherStorage';
import { restrictedKeywords } from '@root/src/shared/utils/posts';

import axios from 'axios';
import { CSSProperties, useEffect, useState } from 'react';
import LoadingOverlay from 'react-loading-overlay-ts';
import { toast, Toaster } from 'sonner';
interface FormDataType {
  pageView: string;
  elementOrComponent: string | number;
  description?: string;
}

const pageOptions = [
  { label: 'Home Page', value: 'Home Page' },
  { label: 'Memberships Page', value: 'Memberships Page' },
  { label: 'Creators Page', value: 'Creators Page' },
  { label: 'Other', value: 'Other' },
];

const allViewsOptions = [
  { label: 'Readeon View', value: 'Readeon View' },
  { label: 'Show Only Chapters', value: 'Show Only Chapters' },
  { label: 'Last Read Post', value: 'Last Read Post' },
  { label: 'Last Read Post Pop-up', value: 'Last Read Post Pop-up' },
  { label: 'Full Screen Button', value: 'Full Screen Button' },
  { label: 'Full Screen View', value: 'Full Screen View' },
  { label: 'Post Navigation', value: 'Post Navigation' },
  { label: 'Edit Suggestions', value: 'Edit Suggestions' },
  { label: 'Text Settings', value: 'Text Settings' },
  { label: 'Download Feature', value: 'Download Feature' },
  { label: 'Readeon Overlay', value: 'Readeon Overlay' },
];

const otherOptions = [{ label: 'Other', value: 'Other' }];

export const selectStyle = {
  width: '100%',
  backgroundColor: 'var(--global-bg-elevated-default)',
  lineHeight: 1.5,
} as CSSProperties;

export const labelStyle = {
  fontSize: 'var(--global-fontSizes-body-md)',
  fontWeight: 'var(--global-fontWeights-display-default)',
} as CSSProperties;

export const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const isRestrictedPageHandle = () => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const lastPart = pathParts[pathParts.length - 1].toLowerCase();
  return restrictedKeywords.includes(lastPart);
};
const ReportPopUp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataType | null>();
  const [elementOptions, setElementOptions] = useState<OptionsType[]>([]);
  const [isConfirmation, setConfirmation] = useState<boolean>(false);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [controlModal, setControlModal] = useState<boolean>(false);
  const matcher = useStorage(matcherStorage);
  const handleClose = async () => {
    if (formData) {
      setIsCancel(true);
    } else {
      setIsModalOpen(false);
    }
  };
  const handleMessageEvent = event => {
    if (event.data.type === 'Open_Readeon_Control') {
      setControlModal(true);
    }
  };

  useEffect(() => {
    const handleChromeMessage = (request: any) => {
      if (request?.message === 'report_modal') {
        setIsModalOpen(true);
      }
    };
    chrome?.runtime?.onMessage?.addListener(handleChromeMessage);
    // const ReportBtnEle = document?.getElementById('patreon-report-btn');
    window.addEventListener('message', handleMessageEvent);
    return () => {
      // ReportBtnEle.removeEventListener('click', openModal);
      chrome?.runtime?.onMessage?.removeListener(handleChromeMessage);
    };
  }, []);

  const handlePageChange = (selectedOption: string) => {
    setFormData(p => ({ ...p, pageView: selectedOption }));
    if (['Home Page', 'Memberships Page', 'Creators Page'].includes(selectedOption)) {
      const filteredOptions =
        selectedOption === 'Home Page'
          ? allViewsOptions.filter(option => option.value !== 'Readeon Overlay') // Show all options for Home Page
          : allViewsOptions.filter(option => option.value !== 'Full Screen Button');
      setElementOptions(filteredOptions);
    } else {
      setElementOptions(otherOptions);
    }
  };
  const detectBrowser = () => {
    const userAgent = navigator?.userAgent;

    if (userAgent.includes('Firefox')) {
      return 'firefox';
    } else if (userAgent.includes('Chrome')) {
      return 'chrome';
    } else {
      return 'unknown';
    }
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();

    setConfirmation(true);
  };
  const handleConfirmationClose = () => {
    setConfirmation(false);
  };
  const handleConfirmationSubmit = async () => {
    try {
      setConfirmation(false);
      setIsLoading(true);
      const response = await axios.post(`https://www.readeon.com/api/reported-problem/create`, {
        page: formData?.pageView,
        componentName: formData?.elementOrComponent,
        description: formData?.description,
        browser: detectBrowser(),
      });

      if (response?.status === 201) {
        setIsLoading(false);
        setIsModalOpen(false);
        setFormData(null);
        toast.success(
          <div style={{ fontSize: '15px', width: '400px' }}>
            Thanks for reporting the problem! Give us some time to examine the issue and we will email you accordingly.
            To keep progress on reported problems, check this{' '}
            <a
              href="https://docs.google.com/document/d/1HoBpVSsRgFcDc_woSHf9GnvJoUojxXOxa6tUVjJIjv4/edit"
              target="_blank"
              rel="noreferrer">
              document
            </a>
            .
          </div>,
          { duration: 30000, closeButton: true },
        );
      } else if (response?.status === 200) {
        setIsLoading(false);
        setIsModalOpen(false);
        setFormData(null);
        toast.warning(
          <div style={{ fontSize: '15px', width: '400px' }}>
            A report for this issue has already been submitted. We are working as fast as possible to get it resolved.
            You can{' '}
            <a
              href="https://docs.google.com/document/d/1HoBpVSsRgFcDc_woSHf9GnvJoUojxXOxa6tUVjJIjv4/edit?usp=sharing"
              target="_blank"
              rel="noreferrer">
              use this document.
            </a>{' '}
            to see the list of issues we are currently fixing as well as ask for updates. Thank you for your patience.
          </div>,
          { duration: 30000, closeButton: true },
        );
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Something went wrong.');
      console.log('error', { error });
    }
  };

  const handleCloseModelSubmit = () => {
    setIsCancel(false);
    setIsModalOpen(false);
    setFormData(null);
  };
  const handleCloseModelCancel = () => {
    setIsCancel(false);
  };
  const handleRefresh = () => {
    window?.location?.reload();
  };
  const handleOffExt = async () => {
    await extEnableStorage.toggle();
    window?.location?.reload();
  };
  const handleReportedProblem = () => {
    setControlModal(false);
    setIsModalOpen(true);
  };

  const handleEnableClick = () => {
    isEnableStorage.toggle().then();
  };
  return (
    <>
      <Toaster richColors position="top-right" expand />
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title="Report a Problem"
          footer={false}
          body={
            <LoadingOverlay
              active={isLoading}
              spinner={isLoading}
              styles={{
                overlay: base => ({
                  ...base,
                  background: '#00000054',
                }),
                wrapper: base => ({
                  ...base,
                  pointerEvents: isLoading ? 'none' : 'all',
                }),
              }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ textAlign: 'center' }}>
                  Use the buttons below to report your problem and we will try our best to fix it.
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <SelectWrapper>
                      <label style={{ ...labelStyle }} htmlFor="view-select">
                        Page
                      </label>
                      <Select
                        style={{ ...selectStyle }}
                        options={pageOptions}
                        onChange={handlePageChange}
                        placeholder="Select page"
                        defaultValue={formData?.pageView}
                        required
                      />
                    </SelectWrapper>
                    <SelectWrapper>
                      <label style={{ ...labelStyle }} htmlFor="specific-element">
                        Element or Component
                      </label>
                      <Select
                        defaultValue={formData?.elementOrComponent}
                        style={{ ...selectStyle }}
                        options={elementOptions}
                        onChange={value => {
                          setFormData(p => ({ ...p, elementOrComponent: value }));
                        }}
                        placeholder="Select element or component"
                      />
                    </SelectWrapper>
                    <div style={{ display: 'flex', width: '100%' }}>
                      <textarea
                        className="feedback-text-area"
                        value={formData?.description ?? ''}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Enter your description here..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                      <button type="button" className="bookmark_modal_button" onClick={handleClose}>
                        {'Close'}
                      </button>
                      <button className="bookmark_modal_button" type="submit">
                        {'Submit'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </LoadingOverlay>
          }
        />
      )}
      {isConfirmation && (
        <Modal
          isOpen={isConfirmation}
          title="Confirmation"
          footer
          okButtonText="Yes"
          onOk={handleConfirmationSubmit}
          onClose={handleConfirmationClose}
          closeButtonText="No"
          body={
            <div>
              <p>Are you sure you want to submit?</p>
            </div>
          }
        />
      )}

      {isCancel && (
        <Modal
          isOpen={isCancel}
          title="Cancel"
          footer
          okButtonText="Yes"
          onOk={handleCloseModelSubmit}
          onClose={handleCloseModelCancel}
          closeButtonText="No"
          body={
            <div>
              <p>Are you sure you want to cancel?</p>
            </div>
          }
        />
      )}
      {controlModal && (
        <Modal
          portalClassName="readeon-control-portal"
          isOpen={controlModal}
          title="Readeon Controls"
          footer={false}
          closeIcon
          onClose={() => {
            setControlModal(false);
          }}
          body={
            <div style={{ width: '59%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button id="patreon-refresh-btn" active onClick={handleRefresh} text="Readeon Issue? Click to Refresh" />

              <Button
                active
                id="patreon-feedback-btn"
                text="Give Readeon Feedback"
                onClick={() => {
                  window.postMessage({ type: 'Open_Readeon_Feedback' });
                  setControlModal(false);
                }}
              />
              <Button id="readeon-off-btn" active onClick={handleOffExt} text="Turn Readeon Off" />

              <Button id="patreon-report-btn" active onClick={handleReportedProblem} text="Report Readeon Problem" />
              {(matcher === 'creatorPost' || matcher === 'posts') && !isRestrictedPageHandle() && (
                <>
                  <Button
                    id="patreon-overlay-open-btn"
                    active
                    onClick={() => {
                      window.postMessage({ type: 'Open_Readeon_Overlay' });
                      setControlModal(false);
                    }}
                    text="Open Readeon Overlay"
                  />
                </>
              )}
              {((matcher === 'creatorPost' || matcher === 'posts') && !isRestrictedPageHandle()) ||
              window.location.href === 'https://www.patreon.com/home' ? (
                <Button id="patreon-overlay-open-btn" active onClick={handleEnableClick} text="Readeon View" />
              ) : null}
            </div>
          }
        />
      )}
    </>
  );
};

export default ReportPopUp;
