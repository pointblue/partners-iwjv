<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

// This abstract base class defines the basic functionality needed for all map sub classes
// 

/*
 * @author tfonseca
 */
require_once('required.php');

abstract class map
{   
    
   
    public function __construct()
    {
        
    }
    abstract function getHTMLName();
    
    function validateCookie()
    {

        // If there is no chocolatechip cookie an error message will display as defined in the else statement.
        // Comment out the error messange  and uncomment two lines below it if you are testing and it will create a test 
        // cookie instead of displaying the error. This can be very useful when developing/testing.

        $key = "Cli44mate";
        if (isset($_COOKIE['CHOCOLATECHIP']))
        {
            $rawcookie = $this->getCookie("CHOCOLATECHIP");
            $choc = $this->decryptAndUnserialize($rawcookie);
        } else
        {
            print("<h2>You must be logged in through <a href='http://climate.calcommons.org'>climate.calcommons.org</a> to view this content</h2>");
            //$choc = $this->createTestCookie();
            //$choc[signature] = hash_hmac('sha256', $choc['name'] . '/' . $choc['mail'] . '/' . $choc['timestamp'], $key);
        }
        //
        // Verify that the cookie is valid by ensuring it contains a name and an init string, then recreate the signature locally and 
        // compare it to the signature of the cookie sent to us from climate.calcommons.org
        //
        $comp_signature = hash_hmac('sha256', $choc['name'] . '/' . $choc['mail'] . '/' . $choc['timestamp'], $key);

        if ((isset($choc['init']) && isset($choc['name']))
                && $choc[signature] == $comp_signature)
        {
            $init = $choc['init'];
            $name = $choc['name'];
            $mail = $choc['mail'];
            $timestamp = $choc['timestamp'] + 0;
            $temp = explode('/', $init);
            $uid = 0 + $temp[count($temp) - 2];
            $time = date('g:i A', $timestamp);
            //
            //  If the database doesn't have a url for this dataset then use #10 by default
            //  In the future when we have implemented dataset variables use:
            //  $dsName = getDatasetName($db, $_REQUEST[ds]);
            //  $dvName = getDataVariableName($db, $_REQUEST[ds], $_REQUEST[dv]);
            //
            
            return true;
        } else
        {
            return false;
        }
    }

    function getMapURL()
    {
        if (!isset($_REQUEST[ds]))
        {
            $mapURL = $this->getDatasetURL($db, '10');
        } else
        {
            $mapURL = $this->getDatasetURL($db, $_REQUEST[ds]);
        }

        if (isset($_REQUEST[dv]))
        {
            $varName = $this->getDataVariableName($db, $_REQUEST[ds], $_REQUEST[dv]);
            $mapURL.="?var_layer=" . $varName;
        }
        return $mapURL;
    }

    function getDataSetName($ds_id)
    {
        $db = $this->connectToDatabase('maps');
        $query = "SELECT name FROM map WHERE id = " . $ds_id;
        $result = mysql_query($query, $db);
        $name = mysql_fetch_array($result);
        mysql_close($db);
        return ($name[0]);
    }

    function getDataSetURL($ds_id)
    {
        $db = $this->connectToDatabase('maps');
        $query = "SELECT url FROM map WHERE id = " . $ds_id;
        $result = mysql_query($query, $db);
        $url = mysql_fetch_array($result);
        mysql_close($db);
        return ($url[0]);
    }

    function setDataVariableName($ds_id, $dv_id)
    {
        $db = $this->connectToDatabase('maps');
        $query = "SELECT name FROM variable WHERE id = " . $dv_id . " and map_id = " . $ds_id;
        $result = mysql_query($query, $db);
        $name = mysql_fetch_array($result, MYSQL_ASSOC);
        mysql_close($db);
        $_COOKIE[variable] = $name[name];
        //header('Location: '.$url);s
        //return($name[0]);
    }

    function createTestCookie()
    {
        $init = "http://climate.calcommons.org/user/3/edit";
        $name = "tfonseca";
        $mail = "tfonseca@prbo.org";
        $timeStamp = "1333039457";

        $testCookie = array(
            "init" => $init,
            "name" => $name,
            "mail" => $mail,
            "timestamp" => $timeStamp,
            "signature" => ""
        );
        return $testCookie;
        /* <body>
         * init = http://climate.calcommons.org/user/3/edit
         * name = tfonseca
         * mail = tfonseca@prbo.org
         * timestamp = 1333039457
         * uid = 3
         * time = 4:00 PM
          <!-- <object width="100%" height="700" data="http://data.calcommons.org/flintmap/30year.php">  -->
          </body> */
    }

//
//
    function connectToDatabase($dbname = 'maps')
    {
        $connection = @mysql_connect("localhost", "root", '$g44eDuckSoup');
        mysql_select_db($dbname);
        return $connection;
    }

//
/// returns a single cookie by name
//
    public function getCookie($name)
    {
        $rawcookies = $_SERVER['HTTP_COOKIE'];

        foreach (explode(';', $rawcookies) as $pair)
        {
            list($key, $encval) = explode('=', $pair);
            $allcookies[trim($key)] = urldecode(trim($encval));
        }
        return $allcookies[$name];
    }

    protected function decryptAndUnserialize($cookie)
    {
        $td = mcrypt_module_open('rijndael-128', '', 'ecb', '');
        $iv = mcrypt_create_iv(mcrypt_enc_get_iv_size($td), MCRYPT_RAND);
        $key = substr("Cli44mate", 0, mcrypt_enc_get_key_size($td));

        mcrypt_generic_init($td, $key, $iv);
        $decrypted_cookie = mdecrypt_generic($td, $cookie);
        $choc = unserialize($decrypted_cookie);

        mcrypt_generic_deinit($td);
        mcrypt_module_close($td);
        return $choc;
    }
    

}
?>