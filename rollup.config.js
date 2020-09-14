import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import replace from '@rollup/plugin-replace';

const packageProps = require('./package.json');
const isProduction = (process.env.NODE_ENV === 'production') ? true : false;

export default {
    input: ['./src/main.js'],
    output: {
        ...(isProduction? {file: './build/logui.bundle.js'} : {file: './tests/logui.test.bundle.js'}),
        format: 'iife',
        name: 'LogUI'
    },
    plugins: [
        replace({
            __isProduction__: isProduction,
            __buildDate__: () => new Date(),
            __buildVersion__: packageProps.version,
        }),
        resolve(),
        commonjs(),
        babel(),
        uglify(),
    ]
}