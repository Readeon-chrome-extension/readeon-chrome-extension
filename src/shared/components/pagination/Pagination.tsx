/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { Button } from '@src/shared/components/button/Button';
import { FC } from 'react';
import styled from '@emotion/styled';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  isDisabled?: boolean;
  maxPages?: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

const StyledPagination = styled.div<{ isDisabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 35px;
  gap: 10px;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
`;

const StyledPaginationButton = styled(Button)`
  font-size: 14px;
`;
const spinnerStyles = {
  width: '16px',
  height: '16px',
  border: '3px solid rgba(255, 255, 255, 0.3)',
  borderTop: '3px solid white', // Color of the spinner
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  maxPages = 4,
  isDisabled,
  onPageChange,
}) => {
  const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : 1;
  const startPage = Math.max(0, currentPage - Math.floor(maxPages / 2));
  const endPage = Math.min(totalPages, startPage + maxPages - 1);
  const pages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);

  const renderButton = (text: string, onClick: () => void, disabled: boolean, isBtnLoading?: boolean) => (
    <StyledPaginationButton
      style={{ width: text === 'Next' ? '85px' : '' }}
      onClick={onClick}
      text={isBtnLoading ? <div style={spinnerStyles}></div> : text}
      disabled={disabled}
    />
  );

  return (
    <StyledPagination isDisabled={isDisabled}>
      {renderButton('Previous', () => onPageChange(currentPage - 1), currentPage === 1)}
      {pages.map(index => (
        <StyledPaginationButton
          key={index}
          active={currentPage === index + 1}
          onClick={() => onPageChange(index + 1)}
          text={`${index + 1}`}
        />
      ))}
      {renderButton('Next', () => onPageChange(currentPage + 1), currentPage === totalPages)}
    </StyledPagination>
  );
};
