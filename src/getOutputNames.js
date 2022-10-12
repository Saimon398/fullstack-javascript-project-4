/**
 * @description Return loaded filename
 * @param {String} url
 * @param {String} extension
 */
export const getOutputFilename = (url, extension) => {
  const { hostname, pathname } = new URL(url);
  const filename = `${[hostname, pathname].join('').replace(/[^a-z]/g, '-')}${extension}`;
  return filename;
};

/**
 * @description Return dirname where loaded files are kept
 * @param {String} url
 */
export const getOutputDirname = (url, extension) => {
  const { hostname, pathname } = new URL(url);
  const dirname = `${[hostname, pathname].join('').replace(/[^a-z]/g, '-')}${extension}`;
  return dirname;
};
