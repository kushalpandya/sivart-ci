/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 28 November, 2015
 *
 * Sivart Grunt Automation.
 */

/**
 * Initialize global grunt method.
 */
module.exports = function(grunt) {
    var compassDirConfig,
        fnMergeConfig;

    /**
	 * Simple method to merge Objects passed as arguments and return a new Object.
	 */
	fnMergeConfig = function() {
		var obj = {},
			i = 0,
			argl = arguments.length,
			key;

		for (; i < argl; i++) {
			for (key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key))
				{
					obj[key] = arguments[i][key];
				}
			}
		}

		return obj;
	};

    compassDirConfig = {
        imagesDir: 'public/images/src',
        generatedImagesDir: 'public/images/dist',
        httpGeneratedImagesPath: '/images/dist',
        imagesPath: '/images/dist',
        httpImagesPath: '/images/dist',

        sassDir: 'public/scss',
        cssDir: 'public/css',

        noLineComments: true
    };

    /* Initializer configuration */
    grunt.initConfig({

        // Package to run tasks on.
        pkg: grunt.file.readJSON('package.json'),

        compass: {
            dev: {
                options: fnMergeConfig(compassDirConfig, { watch: true, sourcemap: true })
            },
            devbuild: {
                options: fnMergeConfig(compassDirConfig, { force: false, sourcemap: true })
            },
            dist: {
                options: fnMergeConfig(compassDirConfig, { outputStyle: 'compressed' })
            },
            clean: {
                options: fnMergeConfig(compassDirConfig, { clean: true })
            }
        },

        uglify: {
            options: {
                mangle: true
            },
            scripts: {
                files: {
                    'public/js/dist/app.min.js': ['public/js/src/app.js']
                }
            }
        },

        watch: {
            css: {
                files: ['public/scss/**/*.scss'],
                tasks: ['compass:devbuild'],
                options: {
                    livereload: true
                }
            }
        }
    });

    /* Load tasks */
	grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    /* Register tasks */

	/**
	 * Default task, runs Compass in developer mode and
	 * watches for changes SASS files to compile them to CSS upon every modification.
	 */
	grunt.registerTask('default', ['watch']);

    /**
	 * Developer Build task;
	 * 1) Recompiles all SCSS files into CSS (compass:dist).
	 */
	grunt.registerTask('devbuild', ['compass:clean', 'compass:devbuild']);

    /**
	 * Clean task, cleans generated CSS and images and creates
	 * them again with default configuration.
	 */
	grunt.registerTask('clean', ['compass:clean', 'compass:dist']);

    /**
     * Build task;
     * 1) Cleans generated CSS and images (compass:clean).
     * 2) Recompiles all SCSS files into CSS (compass:dist).
     */
    grunt.registerTask('build', ['compass:clean', 'compass:dist', 'uglify:scripts']);
};
