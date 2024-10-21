/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

interface WarningContainerProps {
  text: React.ReactNode;
}
const WarningContainer: React.FC<WarningContainerProps> = ({ text }) => {
  return (
    <div
      style={{
        border: 'var(--global-borderWidth-thin) solid var(--global-border-action-default)',
        backgroundColor: 'var(--global-bg-page-default)',
        borderRadius: 'var(--global-radius-md)',
        padding: '16px',
        margin: '12px 0px',
        textAlign: 'center',
        color: '#FF7F3E',
      }}>
      {text}
    </div>
  );
};
export default WarningContainer;
