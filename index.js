#!/usr/bin/env node
'use strict';

var Promise = require('bluebird');
var argv = require('yargs').argv;
var fs = require('fs');
var colors = require('colors');
var detectiveEs6 = require('detective-es6');
var Table = require('cli-table');
var detective = require('detective'); //NOTE can use this for commonJS
var SortedArrayMap = require('collections/sorted-array-map');
var flatten = require('array-flatten');
var glob = require('glob-fs')({ gitignore: true });
var minimatch = require('minimatch');

Promise.config({
  longStackTraces: true
});

//console.log(argv);


// instantiate table
var table = new Table({
  head: ['times ref.', 'dep name', 'format'],
  colWidths: [15, 50, 10],
  chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
    'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
    'left': '', 'left-mid': '', 'mid': '_', 'mid-mid': '',
    'right': '', 'right-mid': '', 'middle': ' ' },
  style: { 'padding-left': 0, 'padding-right': 0 }
});

var sortfunc = function sortfunc(a, b) {
  if (a.dep_count > b.dep_count) {
    return -1;
  } else if (a.dep_count < b.dep_count) {
    return 1;
  }
  return 0;
};

var useCount = function useCount(depName, loaderFormat) {
  var arr = imported.filter(function (val) {
    return val === depName;
  });

  depMap.set(depName, {
    dep_count: arr.length,
    dep_name: depName,
    dep_format: loaderFormat
  });
};

var path = argv.path || 'src/*';
var pckjson = argv.dep || 'package.json';
var isEs6 = argv.es6;

var imported = [];
var depMap = new SortedArrayMap();
var npmDeps = JSON.parse(fs.readFileSync(pckjson, 'utf8'));
var files = glob.readdirSync(path, {});

// we only need .js files
files = files.filter(minimatch.filter('*.js', { matchBase: true }));

//console.log(files);

var importPrms = files.map(function (_path) {
  var prm = new Promise(function (resolve, reject) {
    var src = fs.readFileSync(_path, 'utf8');
    resolve(detectiveEs6(src));
  });
  return prm;
});

var requirePrms = files.map(function (_path) {
  var prm = new Promise(function (resolve, reject) {
    var src = fs.readFileSync(_path, 'utf8');
    resolve(detective(src));
  });
  return prm;
});

//console.log(importPrms);
//console.log(requirePrms);


if (isEs6) {
  Promise.all(importPrms).then(function (_) {
    imported = flatten(_);
    //console.log({imports:imported});

    var jspmDeps = npmDeps.jspm && npmDeps.jspm.dependencies || {};
    var jspmDevDeps = npmDeps.jspm && npmDeps.jspm.devDependencies || {};

    //let npmDeps = npmDeps.jspm && npmDeps.jspm.dependencies || {};
    //let npmDevDeps = npmDeps.jspm && npmDeps.jspm.dependencies || {};

    for (var prop in jspmDeps) {
      // console.log(`dep: ${prop}`);
      useCount(prop, colors.magenta('es6'));
    }

    for (var _prop in jspmDevDeps) {
      // console.log(`devDep: ${prop}`);
      useCount(_prop, colors.magenta('es6'));
    }

    depMap.sorted(sortfunc).toArray().forEach(function (ele) {
      table.push(['' + ele.dep_count, '' + ele.dep_name, '' + ele.dep_format]);
    });
    console.log(table.toString());
    //console.log(imported);
  }).catch(function (err) {
    return console.log(err);
  });
}

if (!isEs6) {
  Promise.all(requirePrms).then(function (_) {
    imported = flatten(_);
    //console.log({require:_});

    var deps = npmDeps.dependencies || {};
    var devDeps = npmDeps.devDependencies || {};

    for (var prop in deps) {
      // console.log(`dep: ${prop}`);
      useCount(prop, colors.green('CommonJS'));
    }

    for (var _prop2 in devDeps) {
      // console.log(`devDep: ${prop}`);
      useCount(_prop2, colors.green('CommonJS'));
    }

    depMap.sorted(sortfunc).toArray().forEach(function (ele) {
      table.push(['' + ele.dep_count, '' + ele.dep_name, '' + ele.dep_format]);
    });
    console.log(table.toString());
  }).catch(function (err) {
    return console.log(err);
  });
}
