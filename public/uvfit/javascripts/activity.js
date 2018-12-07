function sendReqForActivityInfo(deviceId) {
   $.ajax({
      url: '/activity/summary/' + deviceId,
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: activityInfoSuccess,
      error: activityInfoError
   });
}
function sendReqForActivityLocation(actId) {
   $.ajax({
      url: '/activity/location/' + actId,
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: activityLocationSuccess,
      error: activityInfoError
   });
}
function activityLocationSuccess(data, textStatus, jqXHR){
	//console.log(data.location);
	//$("map").show();
	var coordinates = data.location;
	var mapData = [];
	mapData.length = 0;
	//console.log(coordinates[0]['latitude']);
	var i = 0;
	for(i=0; i<data.location.length;i++){
		var obj = {
			lat: coordinates[i]['latitude'],
			lng: coordinates[i]['longitude']
		};
		mapData.push(obj);
	}
	console.log(mapData);
	//initMap();
	var centerF = parseInt(Math.ceil((data.location.length/2)));
	var flightPlanCoordinates = [
          {lat: 37.772, lng: -122.214},
          {lat: 21.291, lng: -157.821},
          {lat: -18.142, lng: 178.431},
          {lat: -27.467, lng: 153.027}
    ];
	console.log(flightPlanCoordinates);
	var lineSymbol = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    };
var map = new google.maps.Map(document.getElementById("map"), {
		zoom:10,
		center: mapData[1],
		mapTypeId: 'roadmap'
});
var activityPath = new google.maps.Polyline({
		//path: flightPlanCoordinates,
		path: mapData,
		icons: [{
                icon: lineSymbol,
                repeat:'35px',
                offset: '100%'
            }],
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});
	
activityPath.setMap(map);
}

function initMap() {

}

function activityInfoSuccess(data, textStatus, jqXHR){
	allTablePopulate(data, textStatus, jqXHR);
	walkingTablePopulate(data, textStatus, jqXHR);
	runningTablePopulate(data, textStatus, jqXHR);
	bikingTablePopulate(data, textStatus, jqXHR);
}
function allTablePopulate(data, textStatus, jqXHR){
	var data1 = [];
	var i = 0;
	var emptyTable = false;
	for (var activity of data.activity) {
		if(activity.activityId === -1){
			emptyTable = true;
		}
		else{
		var durationString = parseFloat(activityDuration(activity.duration));
		var cal = parseFloat((activity.calories).toFixed(1));
		var tabledata = 
		{actType: activity.activityType, date: "date", duration: durationString, calories: cal, uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1)), activityid: activity.activityId };
		}
		data1[i] = tabledata;
		i += 1;
	}	
	if(!emptyTable){
		var table = new Tabulator("#all-table-here", {
			height:"44vh",
			pagination:"local",
    		paginationSize:10,
			data:data1,
			responsiveLayout:"hide",
			layout:"fitColumns",
			columns:[
					{title:"Activity Type",field:"actType",align:"center"},
					{title:"Date of Activity",field:"date",align:"center"},
					{title:"Duration of Activity",field:"duration",align:"center",bottomCalc:"avg"},
					{title:"Calories Burned",field:"calories",align:"center", bottomCalc:"avg"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
					{title:"Activity ID",field:"activityid", visible:false},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
				var cells = row.getCells();
				var modal = document.getElementById("myModal");
				// Get the <span> element that closes the modal
				var span = document.getElementsByClassName("close")[0];
				modal.style.display = "block";
				
 				//alert("Activity ID " + cells[6].getValue() + " Clicked");
				sendReqForActivityLocation((cells[6].getValue()));
				$("#mapDuration").html((cells[2].getValue()));
				$("#activityMap").html((cells[0].getValue()));
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#all-table-here").empty();
		var prepString = "<h3 class='text-center' id='tableEmptyHere'>There is currently no data for this device to display</h3>";
		//$("#all-table-here").css({"background-color":"white", "border":"none"} );
		$("#all-table-here").html(prepString);
		$("#error").hide();
		$("#main").show();
	}
}
function walkingTablePopulate(data, textStatus, jqXHR){
	var data1 = [];
	var i = 0;
	var emptyTable = false;
	for (var activity of data.activity) {
		if(activity.activityId === -1){
			emptyTable = true;
		}
		else{
		var durationString = parseFloat(activityDuration(activity.duration));
		var cal = parseFloat((activity.calories).toFixed(1));
		var tabledata = 
		{date: "date", duration: durationString, calories: cal, uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1)), activityid: activity.activityId};
		}
		if(activity.activityType === "Walking"){
		data1[i] = tabledata;
		}
		i += 1;
	}	
	if(!emptyTable){
		var table = new Tabulator("#walking-table-here", {
			height:"44vh",
			pagination:"local",
    		paginationSize:10,
			data:data1,
			responsiveLayout:"hide",
			layout:"fitColumns",
			columns:[
					{title:"Date of Activity",field:"date",align:"center"},
					{title:"Duration of Activity",field:"duration",align:"center",bottomCalc:"avg"},
					{title:"Calories Burned",field:"calories",align:"center", bottomCalc:"avg"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
					{title:"Activity ID",field:"activityid", visible:false},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				var cells = row.getCells();
				var modal = document.getElementById("myModal");
				// Get the <span> element that closes the modal
				var span = document.getElementsByClassName("close")[0];
				modal.style.display = "block";

 				//alert("Activity ID " + cells[6].getValue() + " Clicked");
				sendReqForActivityLocation((cells[5].getValue()));
				$("#mapDuration").html((cells[2].getValue()));
				$("#activityMap").html("walking");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#walking-table-here").empty();
		var prepString = "<h3 class='text-center'>There is currently no data for this device to display</h3>";
		$("#walking-table-here").html(prepString);
		$("#error").hide();
		$("#main").show();
	}
}
function runningTablePopulate(data, textStatus, jqXHR){
	var data1 = [];
	var i = 0;
	var emptyTable = false;
	for (var activity of data.activity) {
		if(activity.activityId === -1){
			emptyTable = true;
		}
		else{
		var durationString = parseFloat(activityDuration(activity.duration));
		var cal = parseFloat((activity.calories).toFixed(1));
		var tabledata = 
		{date: "date", duration: durationString, calories: cal, uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1)),activityid: activity.activityId};
		}
		if(activity.activityType === "Running"){
		data1[i] = tabledata;
		}
		i += 1;
	}	
	if(!emptyTable){
		var table = new Tabulator("#running-table-here", {
			height:"44vh",
			pagination:"local",
    		paginationSize:10,
			data:data1,
			responsiveLayout:"hide",
			layout:"fitColumns",
			columns:[
					{title:"Date of Activity",field:"date",align:"center"},
					{title:"Duration of Activity",field:"duration",align:"center",bottomCalc:"avg"},
					{title:"Calories Burned",field:"calories",align:"center", bottomCalc:"avg"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
					{title:"Activity ID",field:"activityid", visible:false},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				var cells = row.getCells();
				var modal = document.getElementById("myModal");
				// Get the <span> element that closes the modal
				var span = document.getElementsByClassName("close")[0];
				modal.style.display = "block";
				
 				//alert("Activity ID " + cells[6].getValue() + " Clicked");
				sendReqForActivityLocation((cells[5].getValue()));
				$("#mapDuration").html((cells[2].getValue()));
				$("#activityMap").html("running");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#running-table-here").empty();
		var prepString = "<h3 class='text-center'>There is currently no data for this device to display</h3>";
		$("#running-table-here").html(prepString);
		$("#error").hide();
		$("#main").show();
	}
}
function bikingTablePopulate(data, textStatus, jqXHR){
	var data1 = [];
	var i = 0;
	var emptyTable = false;
	for (var activity of data.activity) {
		if(activity.activityId === -1){
			emptyTable = true;
		}
		else{
		var durationString = parseFloat(activityDuration(activity.duration));
		var cal = parseFloat((activity.calories).toFixed(1));
		var tabledata = 
		{date: "date", duration: durationString, calories: cal, uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1)),activityid: activity.activityId};
		}
		if(activity.activityType === "Biking"){
		data1[i] = tabledata;
		}
		i += 1;
	}	
	if(!emptyTable){
		var table = new Tabulator("#biking-table-here", {
			height:"44vh",
			pagination:"local",
    		paginationSize:10,
			data:data1,
			responsiveLayout:"hide",
			layout:"fitColumns",
			autoResize: true,
			columns:[
					{title:"Date of Activity",field:"date",align:"center"},
					{title:"Duration of Activity",field:"duration",align:"center",bottomCalc:"avg"},
					{title:"Calories Burned",field:"calories",align:"center", bottomCalc:"avg"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
					{title:"Activity ID",field:"activityid", visible:false},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				var cells = row.getCells();
				var modal = document.getElementById("myModal");
				// Get the <span> element that closes the modal
				var span = document.getElementsByClassName("close")[0];
				modal.style.display = "block";
				
 				//alert("Activity ID " + cells[6].getValue() + " Clicked");
				sendReqForActivityLocation((cells[5].getValue()));
				$("#mapDuration").html((cells[2].getValue()));
				$("#activityMap").html("biking");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#biking-table-here").empty();
		var prepString = "<h3 class='text-center'>There is currently no data for this device to display</h3>";
		$("#biking-table-here").html(prepString);
		$("#error").hide();
		$("#main").show();
	}
}

function activityInfoError(jqXHR, textStatus, errorThrown) {
   // If authentication error, delete the authToken 
   // redirect user to sign-in page (which is index.html)
   if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("signin.html");
   } 
   else {
     $("#error").html("Error: " + status.message);
     $("#error").show();
   } 
}


function activityDuration(length){
	var duration = (length/60).toFixed(1);
	return(duration);
}
function updateRadio(){
	var deviceNum = $("input[name='device']:checked").val();
	
	sendReqForActivityInfo(deviceNum);
}
// Handle authentication on page load
$(function() {
	var modal = document.getElementById("myModal");
	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("signin.html");
   }
	else{
	var deviceNum = $("#firstDevice").val();
	//var deviceNum = $('input[type=radio]:checked').val();
	console.log(deviceNum);
	sendReqForActivityInfo(deviceNum);
	}

   // Register event listeners
	$('.close').click(function(){
				modal.style.display = "none";
	});
	$(window).click(function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});
//$("input[type='radio']").change(updateRadio);
	$("#populateMyDevices").change(updateRadio);

	$("#desiredDevice").change(function() { 
	var deviceNum = $("#desiredDevice").val(); 
	sendReqForActivityInfo(deviceNum);
});
	});
