<?php
namespace Deployer;
require 'recipe/common.php';

// Configuration

set('ssh_type', 'native');
set('ssh_multiplexing', true);

set('repository', 'git@github.com:pointblue/partners-iwjv.git');

set('shared_dirs', []);
set('writable_dirs', []);

// Servers
serverList('servers.yml');



// Tasks

set('bin/npm', function () {
    return (string)run('which npm');
});
desc('Install npm packages');
task('npm:install', function () {
    run("cd {{release_path}} && {{bin/npm}} install");
});
after('deploy:shared', 'npm:install');


desc("run grunt build");
task('grunt:build', function(){
    run("cd {{release_path}} && grunt deploy");
});
after('npm:install', 'grunt:build');



desc('Deploy your project');
task('deploy', [
    'deploy:prepare',
    'deploy:lock',
    'deploy:release',
    'deploy:update_code',
    'deploy:shared',
    'deploy:clear_paths',
    'deploy:symlink',
    'deploy:unlock',
    'cleanup',
    'success'
]);

// [Optional] if deploy fails automatically unlock.
after('deploy:failed', 'deploy:unlock');

