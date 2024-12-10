import { FC, ButtonHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { Tooltip } from 'react-tooltip';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: (e: any) => void;
  text: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  tooltip?: string;
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  font-size: var(--component-fontSizes-button-md);
  font-weight: var(--component-fontWeights-button-default);
  font-family: var(--global-fontStack-button);
  text-decoration: none;
  color: ${({ active }) =>
    active ? 'var(--component-button-onAction-default)' : 'var(--global-content-regular-default)'};
  background-color: ${({ active }) => (active ? 'var(--component-button-action-default)' : 'transparent')};
  border: var(--global-borderWidth-thin) solid
    ${({ active }) => (active ? 'transparent' : 'var(--global-border-action-default)')};
  min-height: 40px;
  max-height: 40px;
  padding: 0 12px;
  border-radius: var(--global-radius-md);
  outline-offset: 0;
  line-height: var(--component-lineHeights-button);
  width: unset;
  white-space: unset;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  @media (min-width: 768px) {
    padding: 0 18px 0 20px;
  }
`;

export const Button: FC<ButtonProps> = ({ onClick, text, active, disabled, className, tooltip, ...rest }) => {
  return (
    <>
      <StyledButton
        data-tooltip-id="button-tooltip-container"
        data-tooltip-content={tooltip}
        onClick={onClick}
        className={className}
        active={active}
        disabled={disabled}
        text={text}
        {...rest}>
        {text}
      </StyledButton>
      <Tooltip id="button-tooltip-container" place={'top-end'} />
    </>
  );
};
