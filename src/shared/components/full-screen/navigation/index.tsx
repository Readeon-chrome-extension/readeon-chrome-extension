/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NavigationProps {
  allowPrevious: boolean;
  isInteractive: boolean;
  isLoading: boolean;
  isRecentView: boolean;
  allowNext: boolean;
  handlePrevious: () => void;
  handleNext: () => void;
  isLatestPost: boolean;
  navigationTooltip: string;
}
const Navigation: React.FC<NavigationProps> = ({
  allowNext,
  isInteractive,
  isLoading,
  isRecentView,
  allowPrevious,
  handleNext,
  handlePrevious,
  isLatestPost,
  navigationTooltip,
}) => {
  return (
    <>
      <button
        data-tooltip-id="my-tooltip"
        style={{
          border: '1px solid var(--global-bg-page-default)',
          borderRadius: '50%',
          backgroundColor: 'var(--global-bg-page-default)',
        }}
        data-tooltip-content={
          isLatestPost ? navigationTooltip : !allowPrevious ? 'No More Posts this Way' : 'Next Post'
        }
        className={`full-screen__navigation full-screen__navigation-left ${isInteractive ? 'interaction-visible' : 'interaction-hidden'}`}
        disabled={isLatestPost || !allowPrevious}
        onClick={handlePrevious}>
        <ChevronLeft size={50} style={{ position: 'relative', right: 1 }} />
      </button>

      <button
        data-tooltip-id="my-tooltip"
        style={{
          border: '1px solid var(--global-bg-page-default)',
          borderRadius: '50%',
          backgroundColor: 'var(--global-bg-page-default)',
        }}
        data-tooltip-content={
          isLatestPost
            ? navigationTooltip
            : isLoading && !isRecentView
              ? 'Getting More Posts'
              : !allowNext
                ? 'No More Posts this Way'
                : 'Previous Post'
        }
        className={`full-screen__navigation full-screen__navigation-right ${isInteractive ? 'interaction-visible' : 'interaction-hidden'}`}
        disabled={isLatestPost || !allowNext}
        onClick={handleNext}>
        <ChevronRight size={50} style={{ position: 'relative', left: 2 }} />
      </button>
    </>
  );
};

export default Navigation;
