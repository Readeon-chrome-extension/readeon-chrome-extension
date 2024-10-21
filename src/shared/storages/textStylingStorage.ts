/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

export type TextAlign = 'left' | 'right' | 'center' | 'justify';
export interface TextStyleType {
  fontSize: string;
  fontFamily: string;
  contentWidth: string;
  spacingClass: string;
  textColor: string;
  backgroundColor: string;
  textAlign: TextAlign;
  lineHeightSpacing: string;
}
type TextStylingStorage = BaseStorage<TextStyleType> & {
  add: (value: TextStyleType) => Promise<void>;
};

const storage = createStorage<TextStyleType>(
  'styling-settings-storage-view-key',
  {
    fontFamily: 'inherit',
    fontSize: 'font-size-24',
    contentWidth: '80%',
    spacingClass: 'paragraph-spacing-30',
    backgroundColor: 'var(--global-bg-page-default)',
    textColor: 'var(--global-content-regular-default)',
    textAlign: 'left',
    lineHeightSpacing: 'line-height-spacing-2',
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const textStylingStorage: TextStylingStorage = {
  ...storage,
  add: async value => {
    await storage.set(prev => ({ ...prev, ...value }));
  },
};

export default textStylingStorage;
