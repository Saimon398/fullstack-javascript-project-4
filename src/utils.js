import * as cheerio from 'cheerio';
import path from 'path';
import axios from 'axios';
import prettier from 'prettier';
import Listr from 'listr';

/**
 * @description Check if URL is Local
 * @param {String} verifiableURL URL to be Verified
 * @param {String} localURL URL to be Compared to
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

/**
 * @description Return Update Name for Loaded Pages
 * @param {String} url
 * @param {String} extension
 * @returns {String} Updated Name
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
  const updatedHTML = prettier.format($.html(), { parser: 'html' });
  return updatedHTML;
};

/**
 * @description Parse Data and Return Needed Links
 * @param {String} data Data to be Parsed
 * @param {String} url URL Where the Data is Located
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
 * @description Return Loaded Local Assets
 * @param {Object} links Links to Local Assets Whose Names to be Updated
 * @returns {Promise} Array of Loaded Local Assets
 */
export const loadLocalAssets = (links) => {
  const responses = [];
  const paths = links.map(({ src, href }) => src ?? href);
  const promises = paths.map((assetPath) => ({
    title: `${assetPath}`,
    task: () => axios({
      method: 'get',
      url: `${assetPath}`,
      responseType: 'arraybuffer',
    })
      .then((response) => responses.push(response))
      .catch((error) => console.error(error)),
  }));
  const tasks = new Listr(promises, { concurrent: true, exitOnError: false });
  return tasks.run()
    .then(() => Promise.all(responses))
    .catch((error) => console.error(error));
};
