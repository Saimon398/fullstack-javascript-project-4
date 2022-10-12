import axios from 'axios';

/**
 * @description Return loaded images
 * @param {Object} links
 * @param {String} url
 * @returns {Promise}
 */
export default (links) => {
  const paths = links.map(({ src, href }) => src ?? href);
  const promises = paths.map((path) => axios({
    method: 'get',
    url: `${path}`,
    responseType: 'arraybuffer',
  }));

  return Promise.all(promises)
    .catch((error) => console.error(error));
};