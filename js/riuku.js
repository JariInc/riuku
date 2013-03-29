var lastItemTimestamp = 0;

$(document).ready(function() {
	
	// init items
	getitems(lastItemTimestamp);
	
	// refresh button
	$("#refresh").click(function( event ) {
		
		$("#refresh").spin("small");
		
		$.getJSON('refresh.php', function(data) {
			//alert(data["time"]);
			if(data["items_added"] > 1)
				$("#alerts").html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>'+ data['items_added'] +' items added in '+ Number((data['time']).toFixed(3)) +' seconds.</div>');
			else if(data["items_added"] == 1)
				$("#alerts").html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>One item added in '+ Number((data['time']).toFixed(3)) +' seconds.</div>');
			else
				$("#alerts").html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>No items added.</div>');
			
			$("#alerts").delay(3000).fadeOut("slow");
			
		})
		.done(function() { 
			$("#refresh").spin(false);
			getitems(lastItemTimestamp);
		})
		.fail(function() { 
			$("#alerts").html('<div class="alert"><button type="button" class="close" data-dismiss="alert">&times;</button>Refreshing feeds failed!</div>');
		});
	});
	
	// manage modal
	$('#manage').on('show', function () {
		getfeeds();
	});
	
	$('#manage').on('hide', function () {
		// clear and get
		$("#items").html("");
		getitems();
	});
	
	// add feed
	$('#addfeed').click(function( event ) {
		var jqxhr = $.ajax( {
			url: "manage.php",
			type: "POST",
			dataType: "json",
			data: { 
				add: true, 
				url: $('#addfeedurl').val() 
			}
		})
		.done(function(data) { alert("Feed '"+ data["name"] +"' added"); })
		.fail(function(data) { alert("Error!"); })
		.always(function() { getfeeds(); }); 
	});
});

function getfeeds() {
	$('#feedlist').html("");
	$.getJSON('manage.php?list=true', function(data) {
		$.each(data["feeds"], function(key, val) {
			$("#feedlist").append('<div class="controls">'+
			'<input class="span5" type="text" value="'+ val['name'] +'" id="name-'+ val["ROWID"] +'">'+
			'<div class="input-append">'+
			'<input class="span4" type="text"  value="'+ val['url'] +'" id="url-'+ val["ROWID"] +'">'+
			'<button class="btn btn-primary modifyfeed" type="button" rowid="'+ val["ROWID"] +'">Save</button>'+
			'<button class="deletefeed btn btn-danger" type="button" rowid="'+ val["ROWID"] +'">Delete</button>'+
			'</div>'+
			'</div><hr>');
		});
	}).always(function() { 
		
		// delete feed
		$('.deletefeed').click(function( event ) {
			var jqxhr = $.ajax( {
				url: "manage.php",
				type: "POST",
				dataType: "json",
				data: { 
					delete: true, 
					rowid: $(this).attr("rowid")
				}
			})
			.done(function(data) { alert("Feed deleted."); })
			.fail(function(data) { alert("Error!"); })
			.always(function() { getfeeds(); }); 
		});
		
		// modify feed
		$('.modifyfeed').click(function( event ) {
			var rowid = $(this).attr("rowid");
			var jqxhr = $.ajax( {
				url: "manage.php",
				type: "POST",
				dataType: "json",
				data: { 
					modify: true, 
					rowid: rowid,
					name: $("#name-"+ rowid).val(),
					url: $("#url-"+ rowid).val()
				}
			})
			.done(function(data) { alert("Feed '"+ $("#name-"+ rowid).val() +"' saved."); })
			.fail(function(data) { alert("Error!"); })
			.always(function() { getfeeds(); }); 
		});
	}); 
}

function getitems(timestamp) {
	$.getJSON('items.php?ts='+ timestamp	, function(data) {
		$.each(data["items"], function(key, val) {
			if(val["timestamp"] > lastItemTimestamp) {
				lastItemTimestamp = val["timestamp"];
			}
			//$("#items").prepend("<p><a href=\""+ val["link"] +"\">"+ val["subject"] +"</a> <small>"+ val["feed"] +"</small></p>");
			$("#items").prepend(
				'<div class="item" item="'+ val['ROWID'] +'">'+
				'	<p class="itemheader">'+
				'		<a>'+ val['subject'] +'</a>'+
				'		<small>'+ val['feed'] +'</small>'+
				'	</p>'+
				'	<div class="well well-small itemcontent" id="item-'+ val['ROWID'] +'">'+
				'		<p>'+ val['content'] +'</p>'+
				'		<p><a class="btn btn-mini btn-primary" href="'+ val['link'] +'">More</a></p>'+
				'	</div>'+
				'</div>'
				/*
				'<div class="accordion-group">'+
				'	<div class="accordion-heading">'+
				'		<a class="accordion-toggle" data-toggle="collapse" data-parent="#items" href="#item-'+ val['ROWID'] +'">'+
				'			'+ val['subject'] +
				'		</a>'+
				'	</div>'+
				'	<div id="item-'+ val['ROWID'] +'" class="accordion-body collapse">'+
				'		<div class="accordion-inner">'+
				'			<small>'+ val['feed'] +'</small>'+
				'			<p>'+ val['content'] +'</p>'+
				'			<p><a class="btn btn-mini btn-primary" href="'+ val['link'] +'">More...</a></p>'+
				'		</div>'+
				'	</div>'+
				'</div>'
				*/
			);
		});
	}).done(function(data) {
		$('.itemcontent').hide();
		
		// expand
		$('.item').click(function( event ) {
			var id = $(this).attr("item");
			$('.itemcontent').not('#item-'+ id).hide();
			$('#item-'+ id).toggle();
		});
	}); 
	

}