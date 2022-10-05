#!/usr/bin/env node
import { program } from 'commander';

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o --output [dir]', 'output dir (default: "/home/user/current-dir"')
  .argument('<url>');

program.parse(process.argv);
