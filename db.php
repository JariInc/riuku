<?php

class db {
	private $handle;

	function __construct($filename) {
		$this->handle = sqlite_open($filename, 0644, $error);
		if (!$this->handle) die("Cannot open DB: '$error'\n");
		
		// check what tables we have and create if missing
		$sql = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;";
		$res = $this->query($sql);
		
		if(count($res) == 0) {
			$sql = "CREATE TABLE feeds(name text NOT NULL, url text NOT NULL);";
			$this->query($sql);
			
			$sql = "CREATE TABLE items(feed integer NOT NULL, timestamp datetime, subject text, content text, link text);";
			$this->query($sql);
		}
	}
	
	function query($query) {
		$result = sqlite_query($this->handle, $query, SQLITE_BOTH, $error);
		if(!$result) die("Cannot execute query '$query' '$error'\n");
		else return sqlite_fetch_all($result, SQLITE_ASSOC);
	}
	
	function __destruct() {
		sqlite_close($this->handle);
	}
}

?>