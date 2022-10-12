import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import debug from 'debug';
import parse from './src/parse.js';
import loadLocalSources from './src/loadLocalSources.js';
import updateAttributes from './src/updateAttributes.js';
import { getOutputDirname, getOutputFilename } from './src/getOutputNames.js';
import 'axios-debug-log';


const logger = debug('page-loader');

/**
 * @description Load pages by given URL and keeps them in the dir
 * @param {String} url
 * @param {String} dirpath
 */
export default (url, dirpath) => {
  const outputDirname = getOutputDirname(url, '_files');
  const outputFilename = getOutputFilename(url, '.html');

  logger(`Formation of dirname where loaded pages are kept: ${outputDirname}`);
  logger(`Formation of filename with loaded main page: ${outputFilename}`);

  let markup;
  let links;
  let absoluteDirpath;
  let absoluteFilepath;

  return axios.get(url)
    .then(({ data }) => {
      logger(`GET-request to ${url} to load data`);
      markup = data;
      links = parse(data, url);
      logger('Parse data of local resourses');
      absoluteDirpath = path.join(dirpath, outputDirname);
      logger(`Make a directory where load pages are kept: ${absoluteDirpath}`);
      return fs.mkdir(absoluteDirpath);
    })
    .then(() => {
      absoluteFilepath = path.join(absoluteDirpath, outputFilename);
      logger(`Save home page file: ${absoluteFilepath}`);
      return fs.writeFile(absoluteFilepath, markup, 'utf-8');
    })
    .then(() => loadLocalSources(links))
    .then((responses) => Promise.all(responses.map(({ config, data }) => {
      const extension = path.extname(config.url);
      const sourceName = getOutputFilename(config.url, extension);
      const absoluteSourcePath = path.join(absoluteDirpath, sourceName);
      logger(`Save local resourse file: ${absoluteSourcePath}`);
      return fs.writeFile(absoluteSourcePath, data, 'utf-8');
    })))
    .then(() => {
      const updatedHTML = updateAttributes(markup, links);
      logger('Update home page file with new names for local resourses');
      return fs.writeFile(absoluteFilepath, updatedHTML, 'utf-8');
    })
    .catch((error) => {
      logger(error);
      throw error;
    });
};