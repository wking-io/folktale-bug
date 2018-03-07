import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const config = {
  input: 'test.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    resolve({
      module: true,
      browser: true,
    }),
    commonjs({
      include: /node_modules/,
    }),
  ],
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify());
}

export default config;
