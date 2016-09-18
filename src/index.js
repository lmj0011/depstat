#!/usr/bin/env node

const Promise = require('bluebird');
const argv = require('yargs').argv;
const fs = require('fs');
const colors = require('colors');
const detectiveEs6 = require('detective-es6');
const Table = require('cli-table');
const detective = require('detective'); //NOTE can use this for commonJS
const SortedArrayMap = require('collections/sorted-array-map');
const flatten = require('array-flatten');
const glob = require('glob-fs')({ gitignore: true });
const minimatch = require('minimatch');

Promise.config({
  longStackTraces: true
});

//console.log(argv);


// instantiate table
const table = new Table({
  head: ['times ref.', 'dep name', 'format'],
  colWidths: [15, 50, 10],
  chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
           'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
           'left': '', 'left-mid': '', 'mid': '_', 'mid-mid': '',
           'right': '', 'right-mid': '', 'middle': ' ' },
  style: { 'padding-left': 0, 'padding-right': 0 }
});

const sortfunc = (a, b)=> {
  if (a.dep_count > b.dep_count) {
    return -1;
  } else if (a.dep_count < b.dep_count) {
    return 1;
  }
  return 0;
};


const useCount = (depName, loaderFormat)=> {
  let arr = imported.filter((val)=> {
    return val === depName;
  });

  depMap.set(depName, {
    dep_count: arr.length,
    dep_name: depName,
    dep_format: loaderFormat
  });
};


let path = argv.path || 'src/*';
let pckjson = argv.dep || 'package.json';
let isEs6 = argv.es6;

let imported = [];
let depMap = new SortedArrayMap();
let npmDeps = JSON.parse(fs.readFileSync(pckjson, 'utf8'));
let files = glob.readdirSync(path, {});

// we only need .js files
files = files.filter(minimatch.filter('*.js', {matchBase: true}));

//console.log(files);

let importPrms = files.map((_path)=> {
  let prm = new Promise((resolve, reject)=> {
    let src = fs.readFileSync(_path, 'utf8');
    resolve(detectiveEs6(src));
  });
  return prm;
});

let requirePrms = files.map((_path)=> {
  let prm = new Promise((resolve, reject)=> {
    let src = fs.readFileSync(_path, 'utf8');
    resolve(detective(src));
  });
  return prm;
});

//console.log(importPrms);
//console.log(requirePrms);


if (isEs6) {
  Promise.all(importPrms).then(_=> {
    imported = flatten(_);
	  //console.log({imports:imported});

    let jspmDeps = npmDeps.jspm && npmDeps.jspm.dependencies || {};
    let jspmDevDeps = npmDeps.jspm && npmDeps.jspm.devDependencies || {};

	  //let npmDeps = npmDeps.jspm && npmDeps.jspm.dependencies || {};
	  //let npmDevDeps = npmDeps.jspm && npmDeps.jspm.dependencies || {};

    for (let prop in jspmDeps) {
		// console.log(`dep: ${prop}`);
      useCount(prop, colors.magenta('es6'));
    }

    for (let prop in jspmDevDeps) {
		 	// console.log(`devDep: ${prop}`);
      useCount(prop, colors.magenta('es6'));
    }

    depMap.sorted(sortfunc).toArray().forEach((ele)=> {
      table.push(
		   [`${ele.dep_count}`, `${ele.dep_name}`, `${ele.dep_format}`]
		);
    });
    console.log(table.toString());
		//console.log(imported);
  })
	.catch(err=> console.log(err))
	;
}


if (!isEs6) {
  Promise.all(requirePrms).then(_=> {
    imported = flatten(_);
	  //console.log({require:_});

    let deps = npmDeps.dependencies || {};
    let devDeps = npmDeps.devDependencies || {};

    for (let prop in deps) {
    // console.log(`dep: ${prop}`);
      useCount(prop, colors.green('CommonJS'));
    }

    for (let prop in devDeps) {
   		// console.log(`devDep: ${prop}`);
      useCount(prop, colors.green('CommonJS'));
    }

    depMap.sorted(sortfunc).toArray().forEach((ele)=> {
      table.push([`${ele.dep_count}`, `${ele.dep_name}`, `${ele.dep_format}`]);
    });
    console.log(table.toString());
  })
	.catch(err=> console.log(err))
	;
}
