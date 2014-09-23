module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    // list of files / patterns to load in the browser
    files: [
      'src/*.js',
      'test/specs/*Spec.js'
    ],
    plugins: [
          'karma-jasmine',
          'karma-coverage',
          'karma-phantomjs-launcher'
    ],
    exclude: [],
    reporters: ['progress','coverage'], 
    preprocessors:{'./src/index.js':['coverage']},
    coverageReporter:{
        type:'html',
        dir:'coverage/'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
