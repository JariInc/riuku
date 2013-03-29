<?php

	require_once("db.php");
	$db = new db("db/riuku.db");

	// TODO: can this be made better/smarter?
	$feeds_data = $db->query("SELECT ROWID, name FROM feeds;");
	$feeds = array();
	
	foreach($feeds_data as $data)
		$feeds[$data["ROWID"]] = $data["name"];

	if((int)$_REQUEST["ts"]) {
		$limit = "
			WHERE timestamp > '". gmdate("Y-m-d H:i:s", (int)$_REQUEST["ts"]) ."' 
			ORDER BY timestamp ASC 
		";
	}
	else {
		$limit = "
			ORDER BY timestamp DESC 
		";
	}
		
	$items = $db->query("
		SELECT 
			ROWID, 
			strftime('%s', timestamp) AS timestamp, 
			feed, 
			subject, 
			content, 
			link
		FROM items 
		$limit
		LIMIT 50;
	");
	
	if((int)$_REQUEST["ts"] == 0) {
		$items = array_reverse($items);
	}
	
	$return = array();
	
	foreach ($items as $item) {
		$return[] = array_merge($item, array("feed" => $feeds[$item["feed"]]));
	}
	
	echo json_encode(array(
		"items" => $return,
	));
	
	$fp = fopen('debug.log', 'a+');
	fwrite($fp, $_REQUEST["ts"] ." ". gmdate("Y-m-d H:i:s", (int)$_REQUEST["ts"]) ."\n");
	fclose($fp);
	
?>