/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import styled from '@emotion/styled';
import { UserProfile } from '@root/src/shared/storages/posts/postsStorage';
import React from 'react';
import WarningContainer from '../warningContainer';
import { TextStyleType } from '@root/src/shared/storages/textStylingStorage';
interface CreatorProfileProps {
  user: UserProfile;
  textStyles?: TextStyleType;
}
const Wrapper = styled.a`
  background: none;
  width: fit-content;
  box-shadow: none;
  border: 0px;
  color: inherit;
  display: grid;
  -webkit-box-pack: center;
  justify-content: center;
  place-items: center;
  -webkit-box-align: center;
  text-align: center;
  margin: var(--global-space-16) 0 0;
  padding: 0px;
  grid-template-columns: 1fr;
  grid-template-rows: 100px 1fr;
  row-gap: var(--global-space-12);
`;
const ProfileWrapper = styled.div`
  display: block;
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: inherit;
`;
const CreatorName = styled.h2<{ textStyles: TextStyleType }>`
  font-family: ${({ textStyles }) => textStyles?.fontFamily};
  font-weight: var(--global-fontWeights-heading-default);
  line-height: var(--global-lineHeights-heading);
  letter-spacing: var(--global-letterSpacing-heading);
  color: ${({ textStyles }) => textStyles?.textColor};
  margin: 0px;
  font-size: var(--global-fontSizes-heading-xl) !important;
`;
const ProfileInnerWrapper = styled.div`
  position: relative;
  border-radius: clamp(var(--global-radius-sm), 15%, var(--global-radius-lg));
  width: 100%;
  padding-bottom: 100%;
`;
const ImageContainer = styled.img`
  border-radius: var(--global-radius-md);
  box-shadow: none;
  position: absolute;
  top: 15px;
  left: 15px;
  width: 70%;
  height: 70%;
  z-index: 0;
  filter: blur(16px);
  transform: scale3d(1.2, 1.2, 1.2);
`;
const ImageWrapper = styled.img`
  display: block;
  border-radius: inherit;
  object-fit: cover;
  z-index: 1;
  background-color: var(--global-constant-white-default);
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0px;
`;
const CreatorProfile: React.FC<CreatorProfileProps> = ({ user, textStyles }) => {
  return (
    <>
      {user?.attributes ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Wrapper href={user?.attributes?.url}>
            <ProfileWrapper>
              <ProfileInnerWrapper>
                <ImageWrapper src={user?.attributes?.avatar_photo_image_urls?.thumbnail_small} loading="lazy" />
              </ProfileInnerWrapper>
              <ImageContainer src={user?.attributes?.avatar_photo_image_urls?.thumbnail_small} loading="lazy" />
            </ProfileWrapper>
            <CreatorName textStyles={textStyles}>{user?.attributes?.name}</CreatorName>
          </Wrapper>
        </div>
      ) : (
        <div className="full-screen__container" style={{ marginTop: '12px' }}>
          <WarningContainer text="Readeon cannot get creator details for this creator" />
        </div>
      )}
    </>
  );
};
export default CreatorProfile;
