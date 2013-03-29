<?php

	require_once("db.php");
	$db = new db("db/riuku.db");

	// TODO: can this be made better/smarter?
	$feeds_data = $db->query("SELECT ROWID, name FROM feeds;");
	$feeds = array();
	
	foreach($feeds_data as $data)
		$feeds[$data["ROWID"]] = $data["name"];
	
	$items = $db->query("SELECT ROWID, strftime('%s', timestamp) AS timestamp, feed, subject, content, link FROM items WHERE timestamp > '". date("Y-m-d H:i:s", (int)$_REQUEST["ts"]) ."' ORDER BY timestamp ASC LIMIT 50;");
	
	$return = array();
	
	foreach ($items as $item) {
		$return[] = array_merge($item, array("feed" => $feeds[$item["feed"]]));
	}
	
	echo json_encode(array(
		"items" => $return,
	));
	
?>