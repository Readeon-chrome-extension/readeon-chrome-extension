/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { Line } from 'rc-progress';
import { CSSProperties } from 'react';

const styles = {
  container: {
    position: 'fixed',
    top: '25px',
    right: '65px',
    width: '260px',
    zIndex: 1000,
    borderRadius: 'var(--global-radius-md)',
    background: 'hsl(208, 100%, 97%)',
    border: 'var(--global-borderWidth-thick) solid hsl(221, 91%, 91%)',
    color: 'hsl(210, 92%, 45%)',
    padding: '12px',
  } as CSSProperties,
};

interface ProgressBarTypes {
  percentage: number;
  message?: string;
  fileType: string;
}

const ProgressBar: React.FC<ProgressBarTypes> = ({ percentage, fileType }) => {
  return (
    <div style={styles.container}>
      <p>{percentage === 100 ? `${fileType} file Downloaded Successfully` : `Downloading ${fileType} file...`}</p>
      <Line percent={percentage} strokeWidth={3} strokeColor="#4BB543" />
    </div>
  );
};

export default ProgressBar;
