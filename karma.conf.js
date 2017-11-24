var path = require('path');

// Karma configuration
module.exports = {

    basePath: '.',

    frameworks: ['jasmine'],
    
    files: ['src/**/*.test.js'],

    //browsers: ['Chrome'],
    browsers: ['ChromeHeadless'],

    // cordovaSettings: {
    //     platforms: ['android'],
    //     mode: 'emulate',
    //     hostip: '10.0.2.2',
    //     target: '0468de2a213eae29',
    //     plugins: [
    //         'cordova-plugin-console'
    //     ]
    // },

    reporters: ['spec', 'coverage-istanbul'],

    preprocessors: {
        'src/**/*.test.js': ['webpack']
    },

    coverageIstanbulReporter: {
        reports: ['text-summary', 'lcov'],
        fixWebpackSourcePaths: true,
        type: 'lcov',
        dir: 'test/report/'
    },

    webpack: {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: path.resolve('src/'),
                    exclude: /\.test\.js$/,
                    loader: 'istanbul-instrumenter-loader'
                }
            ]
        }
    },

    webpackMiddleware: {
        stats: 'errors-only'
    },

    singleRun: true
};