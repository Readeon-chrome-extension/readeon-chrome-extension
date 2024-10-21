/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../../modal/Modal';
import { labelStyle, selectStyle, SelectWrapper } from '@root/src/pages/content/ui/report';
import Select from '../../select-component/select';
import styled from '@emotion/styled';
import { Button } from '../../button/Button';
import { Minus, Plus } from 'lucide-react';
import textStylingStorage, { TextAlign, TextStyleType } from '@root/src/shared/storages/textStylingStorage';

interface TextSettingsProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  textStyles: TextStyleType;
}
const fontSizeOptions = [
  { label: '10px', value: 'font-size-10' },
  { label: '11px', value: 'font-size-11' },
  { label: '12px', value: 'font-size-12' },
  { label: '13px', value: 'font-size-13' },
  { label: '14px', value: 'font-size-14' },
  { label: '15px', value: 'font-size-15' },
  { label: '16px', value: 'font-size-16' },
  { label: '17px', value: 'font-size-17' },
  { label: '18px', value: 'font-size-18' },
  { label: '20px', value: 'font-size-20' },
  { label: '22px', value: 'font-size-22' },
  { label: '24px', value: 'font-size-24' },
  { label: '28px', value: 'font-size-28' },
  { label: '32px', value: 'font-size-32' },
];
const fontFamilyOptions = [
  { label: 'Default', value: 'inherit' },
  { label: 'Open Dyslexic', value: 'OpenDyslexic' },

  { label: 'Arial', value: 'Arial' },
  { label: 'Roboto', value: 'Roboto' },

  { label: 'Open Sans', value: 'OpenSans' },
  {
    label: 'OS Default',
    value:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  },
  { label: 'Comic Sans', value: "'Comic Sans MS', Comic Sans, sans-serif" },
  { label: 'Lucida', value: 'Lucida' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Ubuntu', value: 'Ubuntu' },
  { label: 'Ubuntu Condensed', value: 'Ubuntu Condensed' },
  { label: 'Franklin Gothic', value: 'Franklin Gothic' },
];
const contentWidthOptions = [
  { label: 'Full', value: '100%' },
  { label: '90%', value: '90%' },
  { label: '80%', value: '80%' },
  { label: '70%', value: '70%' },
  { label: '60%', value: '60%' },
  { label: '50%', value: '50%' },
];
const textAlignOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Center', value: 'center' },
  { label: 'Justify', value: 'justify' },
];

const FieldWrapper = styled.div`
  display: flex;
  gap: 12px;
`;

const TextSettings: React.FC<TextSettingsProps> = ({ isModalOpen, textStyles, setIsModalOpen }) => {
  const [spacing, setSpacing] = useState<string>('0');
  const [lineHeight, setLineHeight] = useState<string>('0');

  useEffect(() => {
    const matchParagraph = textStyles?.spacingClass?.match(/\d+/); // This regex matches one or more digits
    const matchLineHeight = textStyles?.lineHeightSpacing?.match(/\d+/);
    if (matchParagraph) {
      setSpacing(matchParagraph[0]);
    }
    if (matchLineHeight) {
      setLineHeight(matchLineHeight[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFontSizeChange = (fontSize: string) => {
    textStylingStorage.add({ ...textStyles, fontSize: fontSize });
  };
  const handleFontFamilyChange = (fontFamily: string) => {
    textStylingStorage.add({ ...textStyles, fontFamily: fontFamily });
  };
  const handleContentWidthChange = (contentWidth: string) => {
    textStylingStorage.add({ ...textStyles, contentWidth: contentWidth });
  };
  const handleIncrease = (setVale: React.Dispatch<React.SetStateAction<string>>, type: 'line' | 'paragraph') => {
    if (Number(type === 'paragraph' ? spacing : lineHeight) < (type === 'paragraph' ? 60 : 10)) {
      const newValue = Number(type === 'paragraph' ? spacing : lineHeight) + 1;
      setVale(String(newValue));

      if (type === 'paragraph')
        textStylingStorage.add({ ...textStyles, spacingClass: `paragraph-spacing-${newValue}` });
      else textStylingStorage.add({ ...textStyles, lineHeightSpacing: `line-height-spacing-${newValue}` });
    }
  };
  const handleDecrease = (setVale: React.Dispatch<React.SetStateAction<string>>, type: 'line' | 'paragraph') => {
    if (type === 'paragraph') {
      if (Number(spacing) > 0) {
        const newValue = Number(spacing) - 1;
        setVale(String(newValue));
        textStylingStorage.add({ ...textStyles, spacingClass: `paragraph-spacing-${newValue}` });
      }
    } else if (type === 'line') {
      if (Number(lineHeight) > 1) {
        const newValue = Number(lineHeight) - 1;
        setVale(String(newValue));
        textStylingStorage.add({ ...textStyles, lineHeightSpacing: `line-height-spacing-${newValue}` });
      }
    }
  };
  const handleOnChange = (
    e: any,
    setVale: React.Dispatch<React.SetStateAction<string>>,
    type: 'line' | 'paragraph',
  ) => {
    const value = e?.target?.value;
    if (Number(value) <= (type === 'paragraph' ? 60 : 10)) {
      setVale(value);
      if (type === 'paragraph')
        textStylingStorage.add({ ...textStyles, spacingClass: `paragraph-spacing-${value?.length ? value : 0}` });
      else
        textStylingStorage.add({
          ...textStyles,
          lineHeightSpacing: `line-height-spacing-${value?.length ? value : 0}`,
        });
    }
  };
  const handleTextAlign = (value: TextAlign) => {
    textStylingStorage.add({ ...textStyles, textAlign: value });
  };
  const getCssVariableValue = (variable: string) => {
    const start = variable.indexOf('--');
    const end = variable.indexOf(')', start);
    const variableUpdated = variable.slice(start, end !== -1 ? end : undefined);
    const colorVal = getComputedStyle(document.documentElement).getPropertyValue(variableUpdated).trim();
    return colorVal;
  };
  const handleReturnDefault = () => {
    setSpacing('30');
    setLineHeight('2');
    textStylingStorage.add({
      fontFamily: 'inherit',
      fontSize: 'font-size-24',
      contentWidth: '80%',
      spacingClass: 'paragraph-spacing-30',
      backgroundColor: 'var(--global-bg-page-default)',
      textColor: 'var(--global-content-regular-default)',
      textAlign: 'left',
      lineHeightSpacing: 'line-height-spacing-2',
    });
  };

  return (
    <Modal
      isRemoveScroll={false}
      isOpen={isModalOpen}
      title="Text Settings"
      style={{
        overlay: {
          zIndex: '1300',
          backgroundColor: 'transparent',
          overflowY: 'auto',
          overflowX: 'hidden',
        },
      }}
      onClose={() => setIsModalOpen(false)}
      footer={false}
      closeIcon
      maskClosable
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="width-full">
          <FieldWrapper className="width-full">
            <SelectWrapper className="width-full">
              <label style={{ ...labelStyle }} htmlFor="view-select">
                Font Size
              </label>
              <Select
                placeholder="Font Size"
                style={{ ...selectStyle }}
                options={fontSizeOptions}
                onChange={handleFontSizeChange}
                defaultValue={textStyles?.fontSize}
              />
            </SelectWrapper>
            <SelectWrapper className="width-full">
              <label style={{ ...labelStyle }} htmlFor="view-select">
                Font Family
              </label>
              <Select
                placeholder="Font Family"
                style={{ ...selectStyle }}
                options={fontFamilyOptions}
                onChange={handleFontFamilyChange}
                defaultValue={textStyles?.fontFamily}
              />
            </SelectWrapper>
          </FieldWrapper>

          <FieldWrapper>
            <SelectWrapper className="width-50">
              <label style={{ ...labelStyle }} htmlFor="view-select">
                Reader Width
              </label>
              <Select
                placeholder="Reader Width"
                style={{ ...selectStyle }}
                options={contentWidthOptions}
                onChange={handleContentWidthChange}
                defaultValue={textStyles?.contentWidth}
              />
            </SelectWrapper>

            <SelectWrapper className="width-50">
              <label style={{ ...labelStyle }} htmlFor="view-select">
                Paragraph Spacing
              </label>

              <FieldWrapper>
                <Button
                  tooltip="Decrease Spacing"
                  onClick={() => handleDecrease(setSpacing, 'paragraph')}
                  text={<Minus />}
                  className="px-1"
                />
                <input
                  min={0}
                  max={60}
                  type="number"
                  className="input-style"
                  value={spacing}
                  onChange={e => handleOnChange(e, setSpacing, 'paragraph')}
                />
                <Button
                  tooltip="Increase Spacing"
                  onClick={() => handleIncrease(setSpacing, 'paragraph')}
                  text={<Plus />}
                  className="px-1"
                />
              </FieldWrapper>
            </SelectWrapper>
          </FieldWrapper>

          <FieldWrapper>
            <SelectWrapper className="width-full">
              <label>Text Color</label>
              <input
                type="color"
                className="width-full"
                id="colorInput"
                value={
                  textStyles?.textColor?.startsWith('var(')
                    ? getCssVariableValue(textStyles?.textColor)
                    : textStyles?.textColor
                }
                onChange={e => {
                  const value = e?.target?.value;
                  textStylingStorage.add({ ...textStyles, textColor: value });
                }}
              />
            </SelectWrapper>

            <SelectWrapper className="width-full">
              <label>Background Color</label>
              <input
                type="color"
                className="width-full"
                id="colorInput"
                value={
                  textStyles?.backgroundColor?.startsWith('var(')
                    ? getCssVariableValue(textStyles?.backgroundColor)
                    : textStyles?.backgroundColor
                }
                onChange={e => {
                  const value = e?.target?.value;
                  textStylingStorage.add({ ...textStyles, backgroundColor: value });
                }}
              />
            </SelectWrapper>
          </FieldWrapper>
          <FieldWrapper>
            <SelectWrapper className="width-50">
              <label>Text Alignment</label>
              <Select
                placeholder="Text Alignment"
                style={{ ...selectStyle }}
                options={textAlignOptions}
                onChange={handleTextAlign}
                defaultValue={textStyles?.textAlign}
              />
            </SelectWrapper>
            <SelectWrapper className="width-50">
              <label style={{ ...labelStyle }} htmlFor="view-select">
                Line Spacing
              </label>

              <FieldWrapper>
                <Button
                  tooltip="Decrease Spacing"
                  onClick={() => handleDecrease(setLineHeight, 'line')}
                  text={<Minus />}
                  className="px-1"
                />
                <input
                  min={1}
                  max={10}
                  type="number"
                  className="input-style"
                  value={lineHeight}
                  onChange={e => handleOnChange(e, setLineHeight, 'line')}
                />
                <Button
                  tooltip="Increase Spacing"
                  onClick={() => handleIncrease(setLineHeight, 'line')}
                  text={<Plus />}
                  className="px-1"
                />
              </FieldWrapper>
            </SelectWrapper>
          </FieldWrapper>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Button text="Return to Default" onClick={handleReturnDefault} />
          </div>
        </div>
      }
    />
  );
};
export default TextSettings;
