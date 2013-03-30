<?php 
	include("header.inc.php");
?>
	<h1>Google reader import</h1>
	<form method="post" action="google-reader-import.php" enctype="multipart/form-data">
		<p><input type="file" name="subs"></p>
		<p><input type="submit" class="btn btn-primary" value="Import"></p>
	</form>
<?php

	if($_FILES) {
		$xml = simplexml_load_file($_FILES['subs']['tmp_name']);
		
		require_once('simplepie_loader.php');
		require_once("db.php");
		
		$db = new db("db/riuku.db");
		$feed = new SimplePie();
		
		echo "<h2>Feeds added</h2>";
		echo "<ul>";
		foreach($xml->xpath('//@xmlUrl') as $element) {
			$url = (string)$element[0];
			$feed->set_feed_url($url);
			$feed->init();
			$feed->handle_content_type();

			$name = $feed->get_title();

			$db->query("INSERT INTO feeds(name, url) VALUES('". sqlite_escape_string($name) ."', '". sqlite_escape_string($url) ."');");
		
			echo "<li>". $name ."</li>";
			
			flush();
		}
		
		echo "</ul>";

	}
	
	include("footer.inc.php");
?>