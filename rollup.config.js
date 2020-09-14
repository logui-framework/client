import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

const packageProps = require('./package.json');
const isProduction = (process.env.NODE_ENV === 'production') ? true : false;
const buildEnvironment = (process.env.NODE_ENV === 'production') ? 'production' : 'test';
const uglifyBuild = (process.env.NOUGLIFY == 'true') ? false : true;

export default {
    input: ['./src/main.js'],
    output: {
        ...(isProduction ? {file: './build/logui.bundle.js'} : {file: './tests/logui.test.bundle.js'}),
        format: 'iife',
        name: 'LogUI'
    },
    plugins: [
        ...uglifyBuild ? [
            replace({
                __isProduction__: isProduction,
                __buildDate__: () => new Date(),
                __buildVersion__: packageProps.version,
                __buildEnvironment__: buildEnvironment,
            }),
            resolve(),
            commonjs(),
            babel(),
            uglify(),
        ]: [
            replace({
                __isProduction__: isProduction,
                __buildDate__: () => new Date(),
                __buildVersion__: packageProps.version,
                __buildEnvironment__: buildEnvironment,
            }),
            resolve(),
            commonjs(),
            babel(),
        ]
    ]
}