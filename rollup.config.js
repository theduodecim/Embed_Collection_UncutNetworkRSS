import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/app/components/myMarketComponent.ts', // Ensure this matches the actual file path
  output: {
    file: 'dist/my-market-component.min.js',
    format: 'es',
    name: 'MyMarketComponent',
  },
  plugins: [
    resolve(), // Helps resolve file paths and modules
    typescript(), // Processes .ts files
    terser(), // Minifies the output
  ],
};
