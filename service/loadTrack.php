<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('datatypes/point.inc');

include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/loadTrack.xsd');
    
    $auth_token = get_request_argument($dom, 'auth_token');
    $channel_name = get_request_argument($dom, 'name');
    $key = get_request_argument($dom, 'key');
    
    if ($auth_token) {
        auth_set_token($auth_token);
    }

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    if ($channel_name) {
        list($channel_id, $is_owned) = require_channel_accessible($dbconn, $channel_name, $auth_token == null);
        $result_tag = pg_query_params($dbconn, 
                'SELECT time, label, latitude, longitude, altitude, description, url, id '
                . 'FROM tag WHERE tag.channel_id=$1 ORDER BY time;', array($channel_id));
    } else {
        $is_owned = false;
        $result_tag = pg_query_params($dbconn, 'SELECT tag.time, tag.label, tag.latitude, tag.longitude, tag.altitude, tag.description, tag.url, tag.id '
                . 'FROM tag '
                . 'JOIN channel ON channel.id = tag.channel_id '
                . 'JOIN share ON channel.id = share.channel_id '
                . 'WHERE share.key = $1 AND share.remain != 0 ORDER BY time;', array($key));
        
        if (pg_num_rows($result_tag) === 0) {
            throw new Exception("Key invalid or expired", 1);
        }
    }
    
    $xml = '<kml xmlns="http://www.opengis.net/kml/2.2">';
    $xml .= '<Document>';
    $xml .= '<name>' . $channel_name . '.kml</name>';
    $xml .= '<open>1</open>';
    $xml .= '<Style id="styleDocument"><LabelStyle><color>ff0000cc</color></LabelStyle></Style>';

    // Output points
    while ($row = pg_fetch_row($result_tag)) {
        $point = Point::makeFromPgRow($row);
        $point->access = $is_owned && $auth_token !== null;
        $xml .= $point->toKmlPlacemark();
    }

    $xml .= '</Document>';
    $xml .= '</kml>';

    send_result(0, 'success', $xml);
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
