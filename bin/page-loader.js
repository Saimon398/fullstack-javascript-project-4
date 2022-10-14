#!/usr/bin/env node
import { program } from 'commander';
import pageLoader from '../index.js';
import process from 'process';

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o --output [dir]', 'output dir (default: "/home/user/current-dir"', process.cwd())
  .argument('<url>')
  .action((url) => {

    const dirpath = program.opts().output;
    pageLoader(url, dirpath)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });

program.parse(process.argv);
