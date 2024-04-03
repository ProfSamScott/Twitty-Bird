<?php

header("Content-type: text/plain");
try {
    //$dbh = new PDO('mysql:host=localhost;dbname=scottsam', "root", "");
    $dbh = new PDO('mysql:host=localhost;dbname=eotwcom_scottsam', "eotwcom_sam", "vKHoZu?;!}BQ");
} catch (Exception $e) {
    die('["#TwittyBirdDataBaseError"]');
}
$stmt = $dbh->prepare("UPDATE counters SET visits=visits+1 WHERE id='twittybd' LIMIT 1");
$stmt->execute();

$stmt = $dbh->prepare("UPDATE tbtags SET time=" . (time() + 30) . " where time<" . time() . " LIMIT 1");
$stmt->execute();
if ($stmt->rowCount() == 1) {
// ***** authenticate 
// NO NEED TO EVER DO THIS AGAIN UNLESS YOU INVALIDATE THE ACCESS TOKEN

    /* /
      session_start();
      if (!isset($_SESSION["access_token"])) {
      $url = 'https://api.twitter.com/oauth2/token';
      $data = array('grant_type' => 'client_credentials');
      $apikey = "fAFV0Sw03E3ogqnGElPWxw";
      $apisecret = "rPJk6kW7hIjHGMEFV2tcMw7kZD68G9XJ9IWC0YRvo9Q";
      $authString = base64_encode($apikey . ":" . $apisecret);
      $options = array(
      'http' => array(
      'header' => "Content-Type: application/x-www-form-urlencoded;charset=UTF-8\r\n" .
      "Authorization: Basic $authString",
      'method' => 'POST',
      'content' => http_build_query($data),
      ),
      );
      $context = stream_context_create($options);
      $result = file_get_contents($url, false, $context);

      $_SESSION["access_token"] = json_decode($result)->access_token;
      }
      $auth = "Authorization: Bearer " . $_SESSION['access_token'];
      // */


// THE ACCESS TOKEN BELOW SHOULD BE GOOD FOR LIFE
    $auth = "Authorization: Bearer " . "AAAAAAAAAAAAAAAAAAAAAJz4WAAAAAAAYiuWdpF4AAMvaTYfnXGdKCg2nBY%3Db42EPpJ0CZKiX94zdK7I6Ub0EtaM67EWJWTYY00fJ2bwwyaRsd";


// ******* trending hashtags in various locations

    $woeids = array(23424775, 23424977, 23424748/* , 28298150 */); // order: canada, usa, australia, UK
    /*
      for ($w = 0; $w < sizeof($woeids); $w++) {
      $url = 'https://api.twitter.com/1.1/trends/place.json?id=' . $woeids[$w];
      $options = array(
      'http' => array(
      'header' => "Content-Type: application/x-www-form-urlencoded;charset=UTF-8\r\n" . $auth,
      'method' => 'GET'
      ),
      );
      $context = stream_context_create($options);
      $result = file_get_contents($url, false, $context);
      if ($result) {
      //var_dump($http_response_header);
      $trends = json_decode($result)[0]->trends;
      for ($i = 0; $i < sizeof($trends); $i++) {
      if (substr($trends[$i]->name, 0, 1) == "#") {
      echo $trends[$i]->name . "\r\n";
      }
      }
      echo "---------------------------------\r\n";
      }
      }
     */

// ******* HashTags from Recent Tweets in English
    $search = "e";
    $url = 'https://api.twitter.com/1.1/search/tweets.json?q=' . $search . '&lang=en&count=100&result_type=recent';
    $options = array(
        'http' => array(
            'header' => "Content-Type: application/x-www-form-urlencoded;charset=UTF-8\r\n" . $auth,
            'method' => 'GET'
        ),
    );
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    if ($result) {
        $output = array();
        $searches = json_decode($result)->statuses;
        for ($i = 0; $i < sizeof($searches); $i++) {
            $matches = array();
            preg_match_all('/#[a-z,A-Z][a-z,A-Z,0-9,_]+/', $searches[$i]->text, $matches);
            for ($j = 0; $j < sizeof($matches); $j++) {
                for ($k = 0; $k < sizeof($matches[$j]); $k++) {
                    if (strlen($matches[$j][$k]) > 2 && strtoupper($matches[$j][$k]) != $matches[$j][$k] && !strpos(strtolower($matches[$j][$k]), "follow"))
                        $output[sizeof($output)] = $matches[$j][$k];
                    //echo $matches[$j][$k] . "\r\n";
                }
            }
        }
        $output = json_encode($output);
        echo $output;
        $stmt = $dbh->prepare("UPDATE tbtags SET tags='" . $output . "' LIMIT 1");
        $stmt->execute();
    }
} else {
    $stmt = $dbh->prepare("SELECT tags FROM tbtags LIMIT 1");
    if ($stmt->execute()) {
        if ($row = $stmt->fetch()) {
            echo $row["tags"];
        } else {
            die('["#TwittyBirdDataBaseError"]');
        }
    } else {
        die('["#TwittyBirdDataBaseError"]');
    }
}

