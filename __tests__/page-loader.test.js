import nock from 'nock';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import {
  test, expect, beforeEach,
} from '@jest/globals';
import pageLoader from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const url = 'https://ru.hexlet.io/courses';
let expected;
let tmpDir;

/**
 * @description Return path to fixture
 * @param {String} filename
 * @returns {String}
 */
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

nock.disableNetConnect();

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  expected = await fs.readFile(getFixturePath('content.html'), 'utf-8');
});

test('page loader', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expected);

  await pageLoader(url, tmpDir);
  const [actual] = await fs.readdir(tmpDir, 'utf-8');
  const received = await fs.readFile(path.resolve(tmpDir, actual), 'utf-8');
  expect(received).toEqual(expected);
});
