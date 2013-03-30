<?php 
	include("header.inc.php");
?>
	<h1>Google Reader import</h1>
	<ol>
		<li>Go to <a href="https://www.google.com/takeout">Google takeout</a></li>
		<li>Download an archive of your Google Reader data</li>
		<li>Extract subscriptions.xml from the archive</li>
		<li>Upload subscriptions.xml using the form below</li>
	</ol>
	<h2>Import</h2>
	<form method="post" action="google-reader-import.php" enctype="multipart/form-data">
		<p><input type="file" name="subs"></p>
		<p><input type="submit" class="btn btn-primary" value="Import"></p>
	</form>
<?php

	if($_FILES) {
		$xml = simplexml_load_file($_FILES['subs']['tmp_name']);
		
		require_once("db.php");
		
		$db = new db("db/riuku.db");
		
		echo "<h2>Feeds added</h2>";
		echo "<ol>";
		
		foreach($xml->xpath('//outline') as $element) {
			$attrs = (array)$element->attributes();
			$attrs_arr = $attrs["@attributes"];
			
			$url = $attrs_arr["xmlUrl"] ;
			$name = $attrs_arr["title"];
				
			if($url && $name) {
				$db->query("INSERT INTO feeds(name, url) VALUES('". sqlite_escape_string($name) ."', '". sqlite_escape_string($url) ."');");
				echo "<li>". $name ."</li>";
			}
		}
		echo "</ol>";
	}
	
	include("footer.inc.php");
?>