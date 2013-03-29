<?php

// fix command line working directory
chdir(dirname($_SERVER["SCRIPT_NAME"]));

$begin = microtime(true);

require_once("db.php");
require_once('simplepie_loader.php');

$db = new db("db/riuku.db");

$feeds = $db->query("SELECT ROWID, url FROM feeds;");

$f = new SimplePie();

$addcount = 0;

foreach($feeds as $feed) {
	$f->set_feed_url($feed["url"]);
	$f->init();
	$f->handle_content_type();
	foreach ($f->get_items() as $i) {
		// check if feed with this url exists
		$exists = $db->query("SELECT ROWID FROM items WHERE link = '". $i->get_permalink() ."';");
		
		if(count($exists) == 0) {
			$db->query("
				INSERT INTO 
				items(feed, timestamp, subject, content, link) 
				VALUES(
					'". $feed["ROWID"] ."', 
					datetime('". sqlite_escape_string($i->get_date('U')) ."', 'unixepoch'), 
					'". sqlite_escape_string(html_entity_decode(strip_tags($i->get_title()))) ."', 
					'". sqlite_escape_string($i->get_description()) ."', 
					'". sqlite_escape_string($i->get_permalink()) ."'
				);
			");
			$addcount++;
		}
	}
}

echo json_encode(array(
	"items_added" => $addcount,
	"time" => (microtime(true) - $begin)
));

?>