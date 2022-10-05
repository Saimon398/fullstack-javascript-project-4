#!/usr/bin/env node
import { program } from 'commander';

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1');

program.parse(process.argv);