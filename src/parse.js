import * as cheerio from 'cheerio';
import isLocal from './isLocal.js';

/**
 * @description Parse data and return needed links
 * @param {String} data
 * @param {String} url
 */
export default (html, url) => {
  const $ = cheerio.load(html);
  const links = [];
  const attributesByTags = {
    img: 'src',
    script: 'src',
    link: 'href',
  };
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