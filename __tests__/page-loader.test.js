import nock from 'nock';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import {
  test, expect, beforeEach, beforeAll,
} from '@jest/globals';
import pageLoader from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * @description Return path to fixture
 * @param {String} filename
 * @returns {String}
 */
const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);

nock.disableNetConnect();

let expected1;
let expected2;
let expected3;
let tempDirName;

beforeAll(async () => {
  [expected1, expected2, expected3] = await Promise.all([
    fs.readFile(getFixturePath('before.html'), 'utf-8'),
    fs.readFile(getFixturePath('after.html'), 'utf-8'),
    fs.readFile(getFixturePath('content.html'), 'utf-8'),
  ]);
  nock('https://ru.hexlet.io').get('/languages').reply(200, expected1);
  nock('https://ru.hexlet.io').get('/lessons').reply(404, expected2);
  nock('https://ru.hexlet.io').get('/courses').reply(200, expected3);
});

beforeEach(async () => {
  tempDirName = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('load and save pages with no local resourses', async () => {
  await pageLoader('https://ru.hexlet.io/courses', tempDirName);
  const filepath = path.join(tempDirName, 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html');
  const received = await fs.readFile(filepath, 'utf-8');
  expect(received).toEqual(expected3);
});

// 2) Проверяет сохранение локальных ресурсов
// test('load and save pages with local resourses', async () => {
//   console.log(tempDirName);
//   await pageLoader('https://ru.hexlet.io/languages', tempDirName);
//   const filepath = path
// .join(tempDirName, 'ru-hexlet-io-languages_files/ru-hexlet-io-languages.html');
//   const dirpath = path.join(tempDirName, 'ru-hexlet-io-languages');

//   const received2 = await fs.readFile(filepath, 'utf-8');
//   expect(received2).toEqual(expected2);
//   const loadedFiles = await fs.readdir(dirpath);
//   expect(loadedFiles).toHaveLength(4);
// });

test('throwing errors', async () => {
  expect(() => pageLoader('non-existing url', tempDirName)).toThrow('Invalid URL');
  expect(() => pageLoader('https://ru.hexlet.io/lessons')).rejects.toThrow('404');
});
