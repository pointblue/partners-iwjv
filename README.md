# Intermountain West Joint Venture  

# Project Status  

**DEPRECATED**

This project has not been available on our server since Sep 7, 2022. It was removed because we couldn't afford security updates at that time, but the intention was to replaced the sites with static resource. At this point it's been down for over 4 years. I'm making the decision to archive this repo and move on.  

@mmagana

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
