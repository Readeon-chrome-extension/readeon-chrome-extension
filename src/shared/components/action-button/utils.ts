/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { OptionsType } from '@src/shared/components/select-component/select';

export const extensionTypeOptions: OptionsType[] = [
  { label: 'docx', value: 'docx' },
  { label: 'doc', value: 'doc' },
  { label: 'txt', value: 'txt' },
  { label: 'epub', value: 'epub' },
];

//* this code is used to generate the HTML string for the posts coming.
export const generateFinalPostHtml = (posts, type: string) => {
  const htmlContent = posts
    ?.map(post => {
      const postTitle = `<h1 style="font-size:22px;font-weight:bold;color:#000;line-height:1.2">${post?.title}</h1>`;
      const postContent = post?.content || '';

      let postImages = '';
      if (type !== 'text' && post?.multipleImages?.length) {
        postImages = post.multipleImages
          .map(
            ({ attributes }) =>
              `<img src="${attributes?.image_urls?.default_small}" style="max-width:100%;height:auto;margin-bottom:20px;" />`,
          )
          .join('');
      }

      return `
      <div style='color:#000;overflow-wrap:break-word;'>
        ${postTitle}
        ${postImages}
        ${postContent}
      </div>`;
    })
    .join('<br />');

  return `
		<html>
			<body>
      <style>
        img {
          max-width: 100%;
          width:300px;
          height: auto;
          margin: 20px auto;
          display: block;
        }
      </style>
				${htmlContent}
			</body>
		</html>
	`;
};

// * this below code is meant to be generate the html content as markdown syntax.
export const htmlToFormattedText = html => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const traverseNodes = node => {
    let text = '';

    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent?.trim() ? child.textContent + ' ' : '';
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        switch (child.tagName) {
          case 'H1':
            text += '\n# ' + traverseNodes(child) + '\n';
            break;
          case 'H2':
            text += '\n## ' + traverseNodes(child) + '\n';
            break;
          case 'H3':
            text += '\n### ' + traverseNodes(child) + '\n';
            break;
          case 'H4':
            text += '\n#### ' + traverseNodes(child) + '\n';
            break;
          case 'H5':
            text += '\n##### ' + traverseNodes(child) + '\n';
            break;
          case 'H6':
            text += '\n###### ' + traverseNodes(child) + '\n';
            break;
          case 'P':
            text += '\n' + traverseNodes(child) + '\n';
            break;
          case 'DIV':
          case 'SPAN':
            text += traverseNodes(child) + ' ';
            break;
          case 'A':
            text += `[${traverseNodes(child).trim()}](${child.href})`;
            break;
          case 'BR':
            text += '\n';
            break;
          default:
            if (!['STYLE', 'SCRIPT'].includes(child.tagName)) {
              text += traverseNodes(child);
            }
            break;
        }
      }
    });

    return text;
  };

  return traverseNodes(tempDiv).trim();
};
