#!/usr/bin/env node
import { program } from 'commander';
import process from 'process';
import pageLoader from '../index.js';

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o --output ', 'output dir (default: "/home/user/current-dir"', process.cwd())
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
