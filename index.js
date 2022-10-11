import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

/**
 * @description Return loaded filename
 * @param {String} url
 * @param {String} extension
 */
const getOutputFilename = (url, extension) => {
  const { hostname, pathname } = new URL(url);
  const filename = `${[hostname, pathname].join('').replace(/[^a-z]/g, '-')}${extension}`;
  return filename;
};

/**
 * @description Return dirname where loaded files are kept
 * @param {String} url
 */
const getOutputDirname = (url, extension) => {
  const { hostname, pathname } = new URL(url);
  const dirname = `${[hostname, pathname].join('').replace(/[^a-z]/g, '-')}${extension}`;
  return dirname;
};

/**
 * @description Check if URL is local
 * @param {String} checkedURL
 * @param {String} localURL
 * @returns {Boolean}
 */
const isLocal = (checkedURL, localURL) => {
  if (checkedURL.startsWith('/')) {
    return true;
  }
  const { hostname: checkedHostname } = new URL(checkedURL);
  const { hostname: localHostname } = new URL(localURL);
  return checkedHostname === localHostname;
};

/**
 * @description Parse data and return needed links
 * @param {String} data
 * @param {String} url
 */
const parse = (html, url) => {
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

/**
 * @description Return loaded images
 * @param {Object} links
 * @param {String} url
 * @returns {Promise}
 */
const loadLocalSources = (links) => {
  const paths = links.map(({ src, href }) => src ?? href);
  const promises = paths.map((path) => axios({
    method: 'get',
    url: `${path}`,
    responseType: 'arraybuffer',
  }));

  return Promise.all(promises)
    .catch((error) => console.error(error));
};

/**
 * @description Change names of local attributes to the new ones
 * @param {String} html
 * @param {Object} links
 * @returns
 */
const updateAttributes = (html, links) => {
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

/**
 * @description Load pages by given URL and keeps them in the dir
 * @param {String} url
 * @param {String} dirpath
 */
export default (url, dirpath) => {
  const outputDirname = getOutputDirname(url, '_files');
  const outputFilename = getOutputFilename(url, '.html');

  let markup;
  let links;
  let absoluteDirpath;
  let absoluteFilepath;

  return axios.get(url)
    .then(({ data }) => {
      markup = data;
      links = parse(data, url);
      absoluteDirpath = path.join(dirpath, outputDirname);
      return fs.mkdir(absoluteDirpath);
    })
    .then(() => {
      absoluteFilepath = path.join(absoluteDirpath, outputFilename);
      return fs.writeFile(absoluteFilepath, markup);
    })
    .then(() => loadLocalSources(links))
    .then((responses) => Promise.all(responses.map(({ config, data }) => {
      const extension = path.extname(config.url);
      const sourceName = getOutputFilename(config.url, extension);
      const absoluteSourcePath = path.join(absoluteDirpath, sourceName);
      return fs.writeFile(absoluteSourcePath, data, 'utf-8');
    })))
    .then(() => { 
      const updatedHTML = updateAttributes(markup, links);
      return fs.writeFile(absoluteFilepath, updatedHTML, 'utf-8');
    })
    .catch((error) => console.error(error));
};
