module.exports = function (grunt) {
  var path = require('path')
  var docsRoot = '.grunt/docs'

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-exec')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-jsdoc')
  grunt.loadNpmTasks('grunt-gh-pages')
  grunt.loadNpmTasks('grunt-benchmark')
  grunt.loadNpmTasks('grunt-release')

  grunt.initConfig({
    watch: {
      module: {
        files: ['index.js', 'lib/*'],
        tasks: 'default'
      },
      tests: {
        files: ['test/**/*'],
        tasks: 'exec:test'
      }
    },
    benchmark: {
      all: {
        src: 'benchmark/**/*.js'
      }
    },
    jsdoc: {
      docs: {
        src: ['./*.js', './lib/*.js'],
        options: {
          destination: docsRoot,
          private: true
        }
      }
    },
    'gh-pages': {
      docs: {
        src: '**/*',
        options: {
          base: docsRoot
        }
      }
    },
    exec: {
      test: {
        command: 'npm test'
      },
      docsIndex: {
        // The default index page is mostly empty and confusing
        // This sets it to use the main class' docs
        command: 'cp ' + [path.join(docsRoot, 'Canoe.html'), path.join(docsRoot, 'index.html')].join(' ')
      }
    },
    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      files: ['*.js', '**/*.js', '!node_modules/**/*', '!.*/**/*']
    }
  })

  grunt.registerTask('default', ['jshint', 'exec:test', 'docs'])
  grunt.registerTask('docs', ['jsdoc:docs', 'exec:docsIndex'])

  grunt.registerTask('publish', 'Publish a new version, defaults to patch', function (type) {
    if (! type) type = 'patch'
    grunt.task.run('default', 'release:' + type, 'gh-pages')
  })
}
