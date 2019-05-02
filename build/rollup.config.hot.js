
// import uglify from 'rollup-plugin-uglify';        //js压缩;
const serve = require('rollup-plugin-serve'); // serve服务;
const livereload = require('rollup-plugin-livereload');// 热更新;
const buble = require('rollup-plugin-buble'); // serve服务;
const path = require('path');
const commonjs = require('rollup-plugin-commonjs');

function resolve (str) {
  return path.resolve(__dirname, '../', str);
};

export default {
  input: resolve('src/index.js'), // 入口文件;
  output: {
    file: resolve('dist/index.js'),
    name: 'Promise',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    buble(), commonjs(),
    serve({
      contentBase: resolve('./'),
      host: 'localhost',
      port: 2222,
    }),
    livereload({
      watch: resolve('dist/'),
    })

  ],

};
