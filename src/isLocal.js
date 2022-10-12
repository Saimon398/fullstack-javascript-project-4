/**
 * This module provides a function that defines 
 * if the given URL is local or not
 */

/**
 * @description Check if URL is local
 * @param {String} checkedURL
 * @param {String} localURL
 * @returns {Boolean}
 */
 export default (checkedURL, localURL) => {
  if (checkedURL.startsWith('/')) {
    return true;
  }
  const { hostname: checkedHostname } = new URL(checkedURL);
  const { hostname: localHostname } = new URL(localURL);
  return checkedHostname === localHostname;
};