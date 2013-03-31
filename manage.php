<?php 

require_once('simplepie_loader.php');
require_once("db.php");

$db = new db("db/riuku.db");

if($_REQUEST["add"] && $_REQUEST["url"]) {
	$url = $_REQUEST["url"];

	$feed = new SimplePie();
	$feed->set_feed_url($url);
	$feed->init();
	$feed->handle_content_type();

	$name = $feed->get_title();

	$db->query("INSERT INTO feeds(name, url) VALUES('". sqlite_escape_string($name) ."', '". sqlite_escape_string($url) ."');");

	echo json_encode(array(
		"name" => $name,
		"ok" => true
	));
}
else if($_REQUEST["delete"] && $_REQUEST["rowid"]) {

	$db->query("DELETE FROM items WHERE feed = '". (int)$_REQUEST["rowid"] ."';");
	$db->query("DELETE FROM feeds WHERE ROWID = '". (int)$_REQUEST["rowid"] ."';");

	header('Content-type: application/json');
	echo json_encode(array(
		"ok" => true,
	));
}
else if($_REQUEST["modify"] && $_REQUEST["rowid"]) {

	$db->query("UPDATE feeds SET name = '". sqlite_escape_string($_REQUEST["name"]) ."', url = '". sqlite_escape_string($_REQUEST["url"]) ."' WHERE ROWID = '". (int)$_REQUEST["rowid"] ."';");
	
	header('Content-type: application/json');
	echo json_encode(array(
		"ok" => true,
	));
}

else if($_REQUEST["list"]) {
	$result = $db->query("SELECT ROWID, * FROM feeds;");

	header('Content-type: application/json');
	echo json_encode(array(
		"feeds" => $result,
	));

}

?>