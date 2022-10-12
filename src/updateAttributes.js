import * as cheerio from 'cheerio';
import path from 'path';
import { getOutputFilename } from './getOutputNames.js';

/**
 * @description Change names of local attributes to the new ones
 * @param {String} html
 * @param {Object} links
 * @returns
 */
export default (html, links) => {
  const $ = cheerio.load(html);
  const names = links.map(({ src, href }) => src ?? href);
  const changedNames = names.map((name) => getOutputFilename(name, path.extname(name)));
  links.forEach(({ src, href }, index) => {
    const checkedAttribute = src ? 'src' : 'href';
    const checkedValue = names[index];
    $('html').find(`[${checkedAttribute}=${checkedValue}]`).attr(checkedAttribute, changedNames[index]);
  });
  return $.html();
};
