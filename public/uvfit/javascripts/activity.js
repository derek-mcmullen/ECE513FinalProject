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
		var tabledata = 
		{actType: activity.activityType, date: "date", duration: durationString, calories: "calories", uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1))};
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
					{title:"Calories Burned",field:"calories",align:"center"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				alert("Row " + row.getData().id + " Clicked!!!!");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#all-table-here").empty();
		var prepString = "<h3>There is currently no data for this device to display</h3>";
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
		var tabledata = 
		{date: "date", duration: durationString, calories: "calories", uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1))};
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
					{title:"Calories Burned",field:"calories",align:"center"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				alert("Row " + row.getData().id + " Clicked!!!!");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#walking-table-here").empty();
		var prepString = "<h3>There is currently no data for this device to display</h3>";
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
		var tabledata = 
		{date: "date", duration: durationString, calories: "calories", uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1))};
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
					{title:"Calories Burned",field:"calories",align:"center"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				alert("Row " + row.getData().id + " Clicked!!!!");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#running-table-here").empty();
		var prepString = "<h3>There is currently no data for this device to display</h3>";
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
		var tabledata = 
		{date: "date", duration: durationString, calories: "calories", uv: activity.uv, speed: parseFloat(activity.speed.toFixed(1))};
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
					{title:"Calories Burned",field:"calories",align:"center"},
					{title:"UV Index",field:"uv",align:"center",bottomCalc:"avg"},
					{title:"Speed",field:"speed",align:"center",bottomCalc:"avg"},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				alert("Row " + row.getData().id + " Clicked!!!!");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		$("#biking-table-here").empty();
		var prepString = "<h3>There is currently no data for this device to display</h3>";
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
	console.log(deviceNum);
	sendReqForActivityInfo(deviceNum);
}
// Handle authentication on page load
$(function() {
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
//$("input[type='radio']").change(updateRadio);
	$("#populateMyDevices").change(updateRadio);

	$("#desiredDevice").change(function() { 
	var deviceNum = $("#desiredDevice").val(); 
	sendReqForActivityInfo(deviceNum);
});
	});
