const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 [options]')

  .option('format', {
    alias: 'f',
    describe: 'cjs amd es or umd',
    type: 'string',
  })
  .option('hot', {
    describe: 'hot reload',
    type: 'boolean',
  })
  .option('sourcemap', {
    describe: 'add sourcemap',
    type: 'boolean',
    default: false,
  })
  .argv;

module.exports = argv;
