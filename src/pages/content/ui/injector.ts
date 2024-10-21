/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/pages/injectedScript/index.js');

(document.head || document.documentElement).appendChild(script);

const injectCss = () => {
  const css = `
      @font-face {
        font-family: 'Roboto';
        src: url(${chrome.runtime.getURL('assets/fonts/Roboto-Regular.ttf')}) format('truetype');
        font-weight: normal;
        font-style: normal;
    }
      @font-face {
      font-family: 'Ubuntu';
      src: url(${chrome.runtime.getURL('assets/fonts/Ubuntu-Regular.ttf')}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
      @font-face {
      font-family: 'Ubuntu Condensed';
      src: url(${chrome.runtime.getURL('assets/fonts/UbuntuCondensed-Regular.ttf')}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
      @font-face {
      font-family: 'OpenDyslexic';
      src: url(${chrome.runtime.getURL('assets/fonts/OpenDyslexic-Regular.ttf')}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
      @font-face {
      font-family: 'OpenSans';
      src: url(${chrome.runtime.getURL('assets/fonts/OpenSans-Regular.ttf')}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
      @font-face {
      font-family: 'Lucida';
      src: url(${chrome.runtime.getURL('assets/fonts/Lucida-Regular.ttf')}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    `;
  const styled = document.createElement('style');
  styled.id = 'full-screen-font-family';
  styled.textContent = css;

  if (!document?.head) {
    setTimeout(() => injectCss(), 300);
    return;
  }
  document.head.appendChild(styled);
};
injectCss();
