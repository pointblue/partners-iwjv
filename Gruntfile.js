module.exports = function(grunt){
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        concat:{
            options:{
                separator:';',
                sourceMap:true
            },
            dist:{
                src:[
                    'lib/angular.js',
                    'lib/underscore.js',
                    'app/modules/habpops.data.js',
                    'app/modules/habpops.view.js',
                    'app/modules/habpops.webservice.js',
                    'app/modules/habpops.core.js',
                    'app/constants.js',
                    'app/config.js',
                    'app/**/*.js'
                ],
                dest:'dist/app.js'
            }
        },
        uglify:{
            options:{
                sourceMap:true,
                sourceMapIn:'dist/app.js.map'    //the source map from the 'concat' task
            },
            dist:{
                src:'dist/app.js',
                dest:'dist/app.js'
            }
        },
        watch: {
            scripts: {
                files: ['app/**/*.js'],
                tasks: ['build']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat-sourcemaps');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', 'Build the project', buildTask);
    grunt.registerTask('default', 'Print command instructions', defaultTask);

    function buildTask(){
        grunt.task.run(['concat', 'uglify']);
    }

    function defaultTask(){
        grunt.log.write('\nTask manager for IWJV HABPOPS Web Tool\n\n');
        grunt.log.write('Commands: \n\n');
        grunt.log.write('grunt build\t Build project\n');
        grunt.log.write('grunt concat\t Concat all project files to /app.js\n');
        grunt.log.write('grunt uglify\t Overwrite apps.js with minified code\n');
    }
};