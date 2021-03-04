import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import builtins from 'rollup-plugin-node-builtins';

const packageProps = require('./package.json');
const isProduction = (process.env.NODE_ENV === 'production') ? true : false;
const buildEnvironment = (process.env.NODE_ENV === 'production') ? 'production' : 'test';
const uglifyBuild = (process.env.NOUGLIFY == 'true') ? false : true;
let dispatcherImport = './modules/dispatchers/websocketDispatcher';
let dispatcherImportInPackager = './dispatchers/websocketDispatcher';

switch (process.env.DISPATCHER) {
    case 'console':
        dispatcherImport = './modules/dispatchers/consoleDispatcher';
        dispatcherImportInPackager = './dispatchers/consoleDispatcher';
        break;
}

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
                __dispatcherImport__: dispatcherImport,
                __dispatcherImportInPackager__: dispatcherImportInPackager,
            }),
            builtins(),
            resolve(),
            commonjs(),
            babel({
                runtimeHelpers: true
            }),
            uglify(),
        ]: [
            replace({
                __isProduction__: isProduction,
                __buildDate__: () => new Date(),
                __buildVersion__: packageProps.version,
                __buildEnvironment__: buildEnvironment,
                __dispatcherImport__: dispatcherImport,
                __dispatcherImportInPackager__: dispatcherImportInPackager,
            }),
            builtins(),
            resolve(),
            commonjs(),
            babel({
                runtimeHelpers: true
            }),
        ]
    ]
}