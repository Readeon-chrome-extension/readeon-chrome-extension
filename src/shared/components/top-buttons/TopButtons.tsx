/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { FC } from 'react';
import { Button } from '@src/shared/components/button/Button';
import isEnableStorage from '@src/shared/storages/isEnableStorage';
import useStorage from '@src/shared/hooks/useStorage';
import styled from '@emotion/styled';
import showOnlyChaptersStorage from '@src/shared/storages/posts/showOnlyChaptersStorage';
import config from '@root/src/config';
import { Tooltip } from 'react-tooltip';
import { isViewType } from '@root/src/pages/content/ui/posts-view/PostsView';

const StyledTopButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  gap: 10px;
`;
export const moveTheFocus = (authorKey: string) => {
  const post = document.querySelector(
    `[href="${authorKey}"]${config.pages.recentPosts.authorKeySelector}`,
  ) as HTMLAnchorElement;

  if (post) {
    setTimeout(() => {
      post?.focus();
    }, 200);
  }
};

interface TopButtonsProps {
  authorKey?: string;
  isRecentView?: boolean;
  isView?: isViewType;
}
export const TopButtons: FC<TopButtonsProps> = ({ authorKey, isRecentView, isView }) => {
  const isEnabledStorage = useStorage(isEnableStorage);
  const showOnlyChapters = useStorage(showOnlyChaptersStorage);

  const handleEnableClick = () => {
    isRecentView && moveTheFocus(authorKey);
    isEnableStorage.toggle().then();
  };
  const handleShowOnlyChaptersClick = () => {
    showOnlyChaptersStorage.toggle().then();
  };
  return (
    <StyledTopButtons>
      {isView !== 'Overlay' && <Button text="Readeon View" onClick={handleEnableClick} active={isEnabledStorage} />}
      {isEnabledStorage && (
        <span
          data-tooltip-id="my-tooltip-title-show-only"
          data-tooltip-content="May not work properly depending on post naming.">
          <Button
            text="Show Only Chapters"
            onClick={handleShowOnlyChaptersClick}
            active={showOnlyChapters}
            disabled={!isEnabledStorage}
          />
        </span>
      )}
      <Tooltip
        id={`my-tooltip-title-show-only`}
        place="top"
        style={{ backgroundColor: '#000', textAlign: 'center', zIndex: 3 }}
        opacity={1}
      />
    </StyledTopButtons>
  );
};
