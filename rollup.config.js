
// import uglify from 'rollup-plugin-uglify';        //js压缩;
import serve from 'rollup-plugin-serve'; // serve服务;
import livereload from 'rollup-plugin-livereload';// 热更新;
import buble from 'rollup-plugin-buble'; // serve服务;

export default {
  input: 'src/index.js', // 入口文件;
  output: {
    file: 'dist/promise.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    serve({
      contentBase: 'dist/',
      host: 'localhost',
      port: 10001,
    }),
    livereload({
      watch: 'dist/',
    }),
    buble()
  ],

};
