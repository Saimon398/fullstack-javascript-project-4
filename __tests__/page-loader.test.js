import nock from 'nock';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import {
  test, expect, beforeEach, beforeAll,
} from '@jest/globals';
import { readFile } from 'fs';
import pageLoader from '../index.js';

// Создаются константы, которые формируют путь до фикстур
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * @description Return path to fixture
 * @param {String} filename
 * @returns {String}
 */
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

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
  // nock('https://ru.hexlet.io').get('/courses').reply(200, expected1);
  // nock('https://ru.hexlet.io').get('/courses').reply(200, expected2);
  nock('https://ru.hexlet.io').get('/courses').reply(200, expected3); // Перехватываем запрос по URL = ru.hexlet.io/courses
});

beforeEach(async () => {
  // Будет создаваться перед каждым тестом, и туда будут сохраняться данные
  tempDirName = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

//  Сами тесты

test('load and save pages with no local resourses', async () => {
  // Выводим временную директорию
  console.log(tempDirName);
  // Сохраняем данные во временной директории
  await pageLoader('https://ru.hexlet.io/courses', tempDirName);
  // Теперь мы должны прочитать данные из этой директории
  const received = await fs.readFile(path.join(tempDirName, 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html'), 'utf-8');
  // Сравниваем фикстуру и загруженные данные
  expect(received).toEqual(expected3);
});
