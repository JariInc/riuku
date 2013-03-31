<?php

	require_once("db.php");
	$db = new db("db/riuku.db");

	if($_REQUEST["list"]) {
		
		// TODO: can this be made better/smarter?
		$feeds_data = $db->query("SELECT ROWID, name FROM feeds;");
		$feeds = array();
		
		foreach($feeds_data as $data)
			$feeds[$data["ROWID"]] = $data["name"];
		
		$limit = "";
		
		if((int)$_REQUEST["from"] || (int)$_REQUEST["to"])
			$limit = "WHERE";
		
		if((int)$_REQUEST["from"])
			$limit .= " timestamp > '". gmdate("Y-m-d H:i:s", (int)$_REQUEST["from"]) ."'";
		
		if((int)$_REQUEST["from"] && (int)$_REQUEST["to"])
			$limit .= " AND";
		
		if((int)$_REQUEST["to"])
			$limit .= " timestamp < '". gmdate("Y-m-d H:i:s", (int)$_REQUEST["to"]) ."'";
	
		$limit .= " ORDER BY timestamp ";
		
		if(strtolower($_REQUEST["order"]) == "asc")
			$limit .= "ASC";
		else if(strtolower($_REQUEST["order"]) == "desc")
			$limit .= " DESC";
			
		if((int)$_REQUEST["count"])
			$limit .= " LIMIT ". (int)$_REQUEST["count"];
			
		$items = $db->query("
			SELECT 
				ROWID, 
				strftime('%s', timestamp) AS timestamp, 
				feed, 
				subject, 
				content, 
				link,
				unread
			FROM items 
			$limit;
		");
		
		$items = array_reverse($items);
		$return = array();
		
		foreach ($items as $item) {
			$return[] = array_merge($item, array("feed" => $feeds[$item["feed"]]));
		}
		
		header('Content-type: application/json');
		echo json_encode(array(
			"items" => $return,
		));
	
	}
	else if((int)$_REQUEST["read"]) {
		$db->query("UPDATE items SET unread = '0' WHERE ROWID = '". (int)$_REQUEST["read"] ."';");
	}
	else if(strtolower($_REQUEST["read"]) == "all") {
		$db->query("UPDATE items SET unread = '0';");
	}
	else if($_REQUEST["unread"]) {
		$res = $db->query("SELECT count(*) AS unread_count FROM items WHERE unread = '1';");
		
		header('Content-type: application/json');
		echo json_encode(array(
			"unread" => $res[0]["unread_count"],
		));
	}
	
?>