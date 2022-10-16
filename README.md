## page-loader

### cli-application to load pages and keep them locally

[![Actions Status](https://github.com/Saimon398/fullstack-javascript-project-4/workflows/hexlet-check/badge.svg)](https://github.com/Saimon398/fullstack-javascript-project-4/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/af4ea345483ee261345a/maintainability)](https://codeclimate.com/github/Saimon398/fullstack-javascript-project-4/maintainability)
[![Node CI](https://github.com/Saimon398/fullstack-javascript-project-4/workflows/NodeCI/badge.svg)](https://github.com/Saimon398/fullstack-javascript-project-4/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d14b1ec2c594b72e8471/test_coverage)](https://codeclimate.com/github/Saimon398/fullstack-javascript-project-4/test_coverage)

This tool helps you to load web-pages and local assets and then keep them locally on your machine, no matter how many assets is it contains of.

### Requirements

- Mac / Linux

### Installation

This tool has not been published to NPM, so an installation must be implemented by cloning this repo on you PC. To install utility enter the following command:

```
git clone git@github.com:Saimon398/page-loader.git
```

### Run tests

Addition of new feature demands from developer testing of the ones. There is special doc which is called `Makefile` which helps you to make long commands shorter. Explore that file to see what commands can be launched. In order to run test enter the following command:

```
make test
```

### Check code style

To see if your added feature meets the default standard (Airbnb) enter the following command:

```
make lint
```

### Quick Start

Utility description and its possibilities can be displayed after the following command:

```
page-loader --help
```

Yield the following help output:

```
Usage: page-loader [options] <url>

Page loader utility

Options:
  -V, --version  output the version number
  -o --output    output dir (default: "/home/user/current-dir"
  -h, --help     display help for command
```

### Page loading

Start page loading can be launched by following command.

```
page-loader --output <path/to/dir> <url>
```

Loaded pages will be placed in the directory the path to which is given after `--output` option.
[Here]() you may see how this utility works:
