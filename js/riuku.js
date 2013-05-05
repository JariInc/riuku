var lastItemTimestamp = 0;
var firstItemTimestamp = new Date().getTime()/1000;

$(document).ready(function() {
	
	// init items
	getitems(0, 0, 'desc', 100);
	
	// refresh button
	$("#refresh").click(function( event ) {
		
		$("#refresh").spin("small");
		getitems(lastItemTimestamp, 0, 'desc');
		
		$.getJSON('refresh.php', function(data) {
			
			$("#alerts").show();
			
			if(data["items_added"] > 1)
				$("#alerts").html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>'+ data['items_added'] +' items added in '+ Number((data['time']).toFixed(3)) +' seconds.</div>');
			else if(data["items_added"] == 1)
				$("#alerts").html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>One item added in '+ Number((data['time']).toFixed(3)) +' seconds.</div>');
			else
				$("#alerts").html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>No items added.</div>');
			
			$("#alerts").delay(10000).fadeOut("slow");
			
		})
		.done(function() { 
			$("#refresh").spin(false);
			getitems(lastItemTimestamp, 0, 'desc');
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
		getitems(0, 0, 'desc', 100);
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
	
	// mark all read
	$('#markread').click(function( event ) {
		$("#markread").spin("small");
		$.get('items.php?read=all').done(function() { 
			$("#markread").spin(false);
			updateUnread();
			$("#items").html("");
			getitems(0, 0, 'desc', 50);
		});
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

function getitems(from, to, order, count, append, inverse) {
	var query = "items.php?list=true";
	
	if(count)
		query += '&count='+ count;
	
	if(order)
		query += '&order='+ order;
	
	if(from)
		query += '&from='+ from;
	
	if(to)
		query += '&to='+ to;
	
	$.getJSON(query, function(data) {
		
		if(inverse)
			data["items"] = data["items"].reverse();
		
		$.each(data["items"], function(key, val) {
			
			if(parseInt(val["timestamp"]) > lastItemTimestamp) {
				lastItemTimestamp = parseInt(val["timestamp"]);
			}
			
			if(parseInt(val["timestamp"]) < firstItemTimestamp) {
				firstItemTimestamp = parseInt(val["timestamp"]);
			}
			
			// disable images
			content = val['content'].replace(/src/gi, "srchidden");
			
			if(val["unread"] == 1)
				subject = '<a class="unread">'+ val['subject'] +'</a>';
			else
				subject = '<a>'+ val['subject'] +'</a>';
			
			//var date = new Date(val['timestamp']*1000);
			
			var item = 
			'<div class="item" item="'+ val['ROWID'] +'">'+
			'	<p class="itemheader" id="itemheader-'+ val['ROWID'] +'">'+
			'		'+ subject +
			'		<small>'+ moment(val['timestamp'], "X").fromNow() +' <strong>'+ val['feed'] +'</strong></small>'+
			'	</p>'+
			'	<div class="well well-small itemcontent" id="item-'+ val['ROWID'] +'">'+
			'		<p>'+ content +'</p>'+
			'		<p><a class="btn btn-mini btn-primary" href="'+ val['link'] +'">More</a></p>'+
			'	</div>'+
			'</div>';
			
			if(append)
				$("#items").append(item);
			else
				$("#items").prepend(item);
		});
	}).done(function(data) {
		
		$('.itemcontent img').src="about:blank";
		$('.itemcontent').hide();
		
		// expand
		$('.item').click(function( event ) {
			// don't hide content if button is clicked (extrenal link)
			var target = $(event.target);
			if(!target.hasClass('btn')) {
				var id = $(this).attr("item");
				var scrollbar = $(window).scrollTop();
				var offset = 0;
				$('.itemcontent:visible').not('#item-'+ id).hide();
				
				// show the item
				$('#item-'+ id).toggle();
				
				// enable images
				$('#item-'+ id).html($('#item-'+ id).html().replace(/srchidden/gi, "src"));
				
				// scroll to header and leave 5px margin to top
				if($('.navbar').css('position') == "static") {
					$(window).scrollTop($('#item-'+ id).prev().offset().top - 5);
				}
				else {
					$(window).scrollTop($('#item-'+ id).prev().offset().top - $('.navbar').height() - 5);
				}
				
				// mark it read
				$.get('items.php?read='+ id);
				$('#itemheader-'+ id + ' a').removeClass("unread");
				updateUnread();
			}
		});
		
		// infinite scroll
		$(window).scroll(function(){
			if($(window).scrollTop() == $(document).height() - $(window).height()){
				getitems(0, firstItemTimestamp, "desc", 50, true, true);
			}
		});
	}); 
	updateUnread();
}

function updateUnread() {
	$.getJSON("items.php?unread=true", function(data) {
		if(data['unread'] > 0)
			$('#unread').html('<span class="label label-important">'+ data["unread"] +' unread items</span>');
		else {
			$('#unread').html("");
		}
	});
}