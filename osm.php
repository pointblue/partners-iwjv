<?php



$warp = "`python` C:\\temp\\osm_mapnik\\generate_image.py -121.01854 38.81725 -120.82354 38.93886 568 455";


exec("C:\\Python26\\python.exe C:\\temp\\osm_mapnik\\generate_image.py -121.01854 38.81725 -120.82354 38.93886 568 455");

exec("`C:\\Python26\\python.exe C:\\temp\\osm_mapnik\\generate_image.py -121.01854 38.81725 -120.82354 38.93886 568 455`");

echo $warp;

exec($warp);
shell_exec($warp);
system($warp);
popen($warp);

echo "done";


?>