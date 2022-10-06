#!/usr/bin/env node
import { program } from 'commander';

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o --output [dir]', 'output dir (default: "/home/user/current-dir"')
  .argument('<url>')
  .action((url) => {
    /**
     * Данная функция принимает на вход адрес страницы
     * Скачивает ее из сети - то есть осуществляет GET-запрос по которому возвращается содержимое страницы
     * Кладет ее в указанную директорию при флаге --output
     * Возвращает полный путь к загруженному файлу
     */
    console.log('Everything is done!');
  })

program.parse(process.argv);
