import * as cheerio from 'cheerio';
import path from 'path';
import axios from 'axios';

/**
 * @description Check if URL is local
 * @param {String} checkedURL
 * @param {String} localURL
 * @returns {Boolean}
 */
export const isLocal = (checkedURL, localURL) => {
  if (checkedURL.startsWith('/')) {
    return true;
  }
  const { hostname: checkedHostName } = new URL(checkedURL);
  const { hostname: localHostName } = new URL(localURL);
  return checkedHostName === localHostName;
};

/**
 * @description Return loaded filename
 * @param {String} url
 * @param {String} extension
 */
export const getOutputName = (url, extension) => {
  const { hostname, pathname } = new URL(url);
  const name = `${[hostname, pathname].join('').replace(/[^a-z]/g, '-')}${extension}`;
  return name;
};

/**
 * @description Change names of local attributes to the new ones
 * @param {String} html
 * @param {Object} links
 * @returns
 */
export const updateAttributes = (html, links) => {
  const $ = cheerio.load(html);
  const names = links.map(({ src, href }) => src ?? href);
  const changedNames = names.map((name) => getOutputName(name, path.extname(name)));
  links.forEach(({ src }, index) => {
    const checkedAttribute = src ? 'src' : 'href';
    const checkedValue = names[index];
    $('html').find(`[${checkedAttribute}=${checkedValue}]`).attr(checkedAttribute, changedNames[index]);
  });
  return $.html();
};

/**
 * @description Parse data and return needed links
 * @param {String} data
 * @param {String} url
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
    .each((index, tagName) => {
      const elements = $('html').find(tagName);
      const attributes = elements
        .map((index, element) => $(element)
          .attr(attributesByTags[element]))
        .get()
        .filter(({ src, href }) => {
          if (src || href) {
            const checkedSource = src ?? href;
            return isLocal(checkedSource, url);
          }
        });
      links[index] = attributes;
    });
  return links.flat();
};

/**
 * @description Return loaded images
 * @param {Object} links
 * @param {String} url
 * @returns {Promise}
 */
export const loadLocalSources = (links) => {
  const paths = links.map(({ src, href }) => src ?? href);
  const promises = paths.map((path) => axios({
    method: 'get',
    url: `${path}`,
    responseType: 'arraybuffer',
  }));

  return Promise.all(promises)
    .catch((error) => console.error(error)); // Выбросить ошибку, чтобы ее было видно
};


