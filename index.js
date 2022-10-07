import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * @description Return output filepath
 * @param {String} url 
 * @param {String} extension 
 */
const getOutputFilename = (url, extension) => {
  const { hostname, pathname } = new URL(url);
  const filepath = `${[hostname, pathname].join('').replace(/[^a-z]/g, '-')}${extension}`;
  return filepath;
};

/**
 * @description load pages by given url
 * @param {String} url
 * @param {String} dirpath place where loaded pages are kept
 */
export default (url, dirpath) => {
  return axios.get(url)
    .catch((error) => console.error(error))
    .then(({ data }) => {
      const filepath = getOutputFilename(url, '.html');
      const outputPath = path.join(dirpath, filepath);
      fs.writeFile(outputPath, data);
      return outputPath;
    })
    .catch((error) => console.error(error))
    .then((outputPath) => console.log(outputPath))
    .catch((error) => console.error(error));
};
