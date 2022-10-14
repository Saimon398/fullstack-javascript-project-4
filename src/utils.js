import * as cheerio from 'cheerio';
import path from 'path';
import axios from 'axios';
import prettier from 'prettier';
/**
 * @description Check if URL is local
 * @param {String} verifiableURL URL to be verified
 * @param {String} localURL URL to be compared with
 * @returns {Boolean}
 */
export const isLocal = (verifiableURL, localURL) => {
  if (verifiableURL.startsWith('/')) {
    return true;
  }
  const { hostname: verifiableHostName } = new URL(verifiableURL);
  const { hostname: localHostName } = new URL(localURL);
  return verifiableHostName === localHostName;
};
// ПРОВЕРИТЬ, КАК ФОРМИРУЕТСЯ ИМЯ !!!
/**
 * @description Return updated filename for loaded files
 * @param {String} url
 * @param {String} extension
 * @returns {String} Updated filename
 */
export const getOutputName = (url, extension) => {
  const { hostname, pathname } = new URL(url);
  const name = `${[hostname, pathname].join('').replace(/[^a-z]/g, '-')}${extension}`;
  return name;
};

/**
 * @description Change names of local attributes to the new ones
 * @param {String} html Markup to be updated
 * @param {Object} links Links to local sourses whose names to be updated
 * @param {String} dirname Name of directory where loaded pages are kept
 * @returns {String} Updated markup
 */
export const updateAttributes = (html, links, dirname) => {
  const $ = cheerio.load(html);
  const names = links.map(({ src, href }) => src ?? href);
  const changedNames = names.map((name) => getOutputName(name, path.extname(name)));
  links.forEach(({ src }, index) => {
    const verifiableAttribute = src ? 'src' : 'href';
    const verifiableValue = names[index];
    $('html')
      .find(`[${verifiableAttribute}=${verifiableValue}]`)
      .attr(verifiableAttribute, `${dirname}/${changedNames[index]}`);
  });
  // Здесь нужно отформатировать структуру разметки, так как cheerio ее ломает
  const updatedHTML = prettier.format($.html(), { parser: 'html' });
  return updatedHTML;
};

/**
 * @description Parse data and return needed links
 * @param {String} data Data to be parsed
 * @param {String} url URL where the data is located
 */
export const parse = (html, url) => {
  const $ = cheerio.load(html);
  const attributesByTags = {
    img: 'src',
    script: 'src',
    link: 'href',
  };
  const links = [];

  $(Object.keys(attributesByTags))
    .each((i, tagName) => {
      const elements = $('html').find(tagName);
      const attributes = elements.map((index, element) => $(element)
        .attr(attributesByTags[element]))
        .get()
        .filter(({ src, href }) => {
          if (src || href) {
            const checkedSource = src ?? href;
            return isLocal(checkedSource, url);
          }
          return false;
        });
      links[i] = attributes;
    });
  return links.flat();
};

/**
 * @description Return loaded local sources
 * @param {Object} links Links to local resourses whose names to be updated
 * @returns {Promise} Array of loaded local sources
 */
export const loadLocalSources = (links) => {
  const paths = links.map(({ src, href }) => src ?? href);
  const promises = paths.map((sourcePath) => axios({
    method: 'get',
    url: `${sourcePath}`,
    responseType: 'arraybuffer',
  }));

  return Promise.all(promises)
    .catch((error) => console.error(error));
};

