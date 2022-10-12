import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import parse from './src/parse.js';
import loadLocalSources from './src/loadLocalSources.js';
import updateAttributes from './src/updateAttributes.js';
import { getOutputDirname, getOutputFilename } from './src/getOutputNames.js';

/**
 * @description Load pages by given URL and keeps them in the dir
 * @param {String} url
 * @param {String} dirpath
 */
export default (url, dirpath) => {

  const outputDirname = getOutputDirname(url, '_files');
  const outputFilename = getOutputFilename(url, '.html');

  // Происходит формирование имен вывода для директории
  // Происходит формирование имени вывода для файла
  
  let markup;
  let links;
  let absoluteDirpath;
  let absoluteFilepath;

  return axios.get(url)
    .then(({ data }) => {
      markup = data;
      links = parse(data, url);
      // Происходит парсинг ссылок локальных ресурсов
      absoluteDirpath = path.join(dirpath, outputDirname);
      // Формирование полного пути для директории вывода
      return fs.mkdir(absoluteDirpath);
      // Создание директории, где будут храниться загруженные страницы
    })
    .then(() => {
      absoluteFilepath = path.join(absoluteDirpath, outputFilename);
      // Формирование полного пути для директории вывода
      return fs.writeFile(absoluteFilepath, markup, 'utf-8');
      // Сохранение содержимого загруженной страницы
    })
    .then(() => loadLocalSources(links))
    // Загрузка локальных ресурсов (ссылки на локальном домене)
    .then((responses) => Promise.all(responses.map(({ config, data }) => {
      const extension = path.extname(config.url);
      // Поиск расширения для каждой ссылки 
      const sourceName = getOutputFilename(config.url, extension);
      // Построение имени документа, в котором будет содержаться контент
      const absoluteSourcePath = path.join(absoluteDirpath, sourceName);
      // Построение пути, по которому лежит загруженная ссылка
      return fs.writeFile(absoluteSourcePath, data, 'utf-8');
      // Сохранение загруженной страницы
    })))
    .then(() => {
      const updatedHTML = updateAttributes(markup, links); // ПОСЛЕ ОБНОВЛЕНИЯ НУЖНО ОТКОРРЕКТИРОВАТЬ СТРУКТУРУ
      // Обновление имен локальных ресурсов по всей странице
      return fs.writeFile(absoluteFilepath, updatedHTML, 'utf-8');
      // Сохранение содержимого с новыми именами
    })
    .catch((error) => console.error(error));
};
