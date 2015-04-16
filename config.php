<?php
/**
 * config.php
 *
 * Environment specific configuration for
 * this tool.
 *
 * These variables are exported to Javascript at the top
 * of imjvmap.php with the same variable name
 *
 */

define('SITE_PROTOCOL', 'http');            //Typical protocol used to access this site (used for hardlinking)
define('SITE_HOST', 'data.pointblue.org');  //The production server that this tool is running on
define('SITE_ROUTE', '/parnerts/iwjv');     //Path to this tool relative to the SITE_HOST constant

define('API_PROTOCOL', 'http');         //Protocol to be used when making a request to the API (Example: https)
define('API_HOST', 'data.prbo.org');    //Host server for the api (Example: data.prbo.org)
define('API_ROUTE', '/api/v1/');        //Route for the api that is being called (Example: /api/v1/) Trailing '/' must be provided if it is necessary to make a successful request.
define('API_ROUTE_HABPOP', 'habpop/');
define('API_ROUTE_HABPOP_STATEGONS', 'stategons/');
define('API_ROUTE_HABPOP_ESTIMATES', 'estimates/');

define('GEO_PROTOCOL', 'http');         //Protocol to be used when making a request to the API (Example: https)
define('GEO_HOST', 'geo.pointblue.org');    //Host server for the api (Example: data.prbo.org)

/**
 * $globalsExportToJavascript
 *
 * These are the global variables that will be exported to Javascript
 * by looping through each item in the array, creating a var with the
 * array key as the name and set to the value of the item at that index.
 *
 * Example:
 * $globalsExportToJavascript['FOO'] = 'BAR';
 *
 * The example will produce the following Javascript:
 * var FOO = "BAR"; //Notice that it's using double quotes
 */
$globalsExportToJavascript['SITE_PROTOCOL'] = SITE_PROTOCOL;
$globalsExportToJavascript['SITE_HOST'] = SITE_HOST;
$globalsExportToJavascript['SITE_ROUTE'] = SITE_ROUTE;

$globalsExportToJavascript['API_PROTOCOL'] = API_PROTOCOL;
$globalsExportToJavascript['API_HOST'] = API_HOST;
$globalsExportToJavascript['API_ROUTE'] = API_ROUTE;
$globalsExportToJavascript['API_ROUTE_HABPOP'] = API_ROUTE_HABPOP;
$globalsExportToJavascript['API_ROUTE_HABPOP_STATEGONS'] = API_ROUTE_HABPOP_STATEGONS;
$globalsExportToJavascript['API_ROUTE_HABPOP_ESTIMATES'] = API_ROUTE_HABPOP_ESTIMATES;

$globalsExportToJavascript['GEO_PROTOCOL'] = GEO_PROTOCOL;
$globalsExportToJavascript['GEO_HOST'] = GEO_HOST;