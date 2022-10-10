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
 * @description Parse data and return needed elements
 * @param {String} data
 */
const parse = (data) => {
  const $ = cheerio.load(data);
  const attributesByElems = {
    img: 'src',
  };
  const links = [];

  $(Object.keys(attributesByElems))
    .each((i, tagName) => {
      const elements = $('html').find(tagName); // вернулся массив этих элементов
      const attributes = elements
        .map((j, element) => $(element).attr(attributesByElems[element]))
        .get();
      links[i] = attributes;
    });

  return links
    .flat()
    .map(({ src }) => src);
};
/**
 * @description Return loaded images
 * @param {Object} links
 * @param {String} url
 * @returns
 */
const loadImages = (links) => {
  const promises = links.map((link) => axios({
    method: 'get',
    url: `${link}`,
    responseType: 'arraybuffer',
  }));

  return Promise.all(promises)
    .catch((error) => console.error(error));
};
/**
 * @description Update attributes for img-elements by new ones
 * @param {String} html HTML-markup from loaded page
 * @param {Object} attributes Array with new attribute names for images in order
 * @returns {String}
 */
const updateAtributes = (html, attributes) => {
  const $ = cheerio.load(html);
  $('html').find('img').map((index, descendant) => $(descendant).attr('src', attributes[index]));
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
      links = parse(data);
      absoluteDirpath = path.join(dirpath, outputDirname);
      return fs.mkdir(absoluteDirpath);
    })
    .then(() => {
      absoluteFilepath = path.join(absoluteDirpath, outputFilename);
      return fs.writeFile(absoluteFilepath, markup);
    })
    .then(() => loadImages(links))
    .then((responses) => Promise.all(responses.map(({ config, data }) => {
      const extension = path.extname(config.url);
      const imageName = getOutputFilename(config.url, extension);
      const absoluteImagePath = path.join(absoluteDirpath, imageName);
      return fs.writeFile(absoluteImagePath, data);
    })))
    .then(() => fs.readdir(absoluteDirpath))
    .then((names) => {
      const imageNames = names.map((name) => path.join(outputDirname, name));
      const markupWithUpdatedAttributes = updateAtributes(markup, imageNames);
      // Space for formatting markup if it will be incorrect in comparison to the prevoius one
      return fs.writeFile(absoluteFilepath, markupWithUpdatedAttributes, 'utf-8');
    })
    .catch((error) => console.error(error));
};
