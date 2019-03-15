import nodeResolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import babel from 'rollup-plugin-babel';

export default {
 
  input: './lib/engine/engine.js',
  output: {
    file: './lib/Engine.js',
    format: 'es',
    name: 'Engine'
  },
  sourcemap: true,
  treeshake: false,
  plugins: [
        // babel()
  ]
}