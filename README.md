# Intermountain West Joint Venture  

# Project Status  

This app is currently in transition to becoming a static resource, and is not currently deployed. For more information, see JIRA stories PBI-1834 and PBI-1835.  

## Setup
Clone to: `/WEB_ROOT/partners/iwjv/`

**All commands are executed from the project's root path unless otherwise noted.**

## Install the build environment

 0. Bootstrap the project environment with `yarn install`.
 
 Run the `grunt` command for a print out of available options (developer maintained message!).  
 This also lets you know if the app has been install correctly.

## Deploying the app in production
`yarn run prod`  

This concats all `.js` files and compresses them to the `dist/` folder.

## Building the app
Building is used loosely here. What we're actually doing is concatenating all of the 
javascript into a single file that is loaded by index.html. This need to happen
everytime you make a change to the source.  

### Automatically build the app
Run `grunt watch` to have the build run every time a `.js` file is modified, added, or removed from the `app/` directory.  

### Manually build the app
Run `grunt concat` to manually build the app.  
Usr `grunt concat --verbose` to get more details as the build processes.
