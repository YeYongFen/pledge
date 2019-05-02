const rollup = require('rollup');
const path = require('path');

const buble = require('rollup-plugin-buble'); // serve服务;
const argv = require('./argv.js');
const commonjs = require('rollup-plugin-commonjs');

function resolve (str) {
  return path.resolve(__dirname, '../', str);
};

const format = argv['format'] || 'umd';
// const hot = argv['hot'] || false;
const hasSource = argv['sourcemap'] || false;

const plugins = [buble(), commonjs()];

// if (hot) {
//   plugins.concat([serve({
//     contentBase: resolve('dist/'),
//     host: 'localhost',
//     port: 10001,
//   }),
//   livereload({
//     watch: resolve('/'),
//   })]);
// }

const inputOptions = {
  input: resolve('src/promise/promise.js'),
  plugins,
};

const outputOptions = {
  file: resolve('dist/promise.' + format + '.js'),
  name: 'Promise',
  sourcemap: hasSource,
  format,

};

rollup.rollup(inputOptions).then(function (bundle) {
  bundle.write(outputOptions);
});
