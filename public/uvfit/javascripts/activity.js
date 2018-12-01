function sendReqForActivityInfo(deviceId) {
   $.ajax({
      url: '/activity/summary/' + deviceId,
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: activityInfoSuccess1,
      error: activityInfoError
   });
}

function activityInfoSuccess(data, textStatus, jqXHR) {
   	var prepAllString = "";
	var prepWalkingString = "";
	var prepRunningString = "";
	var prepBikingString = "";
	var walkHasData = "";
	var runHasData = "";
	var bikeHasData = "";
	for (var activity of data.activity) {
   		if(activity.activityId === -1) { 
			prepAllString = "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
			prepWalkingString = "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
			prepRunningString = "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
			prepBikingString = "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
   		} 
		else {  
			prepAllString += "<tr><td>" + activity.activityType + "</td><td>" + "Date Needed" + "</td><td>" + activity.duration + "</td><td>" + "Calories Needed" + "</td><td>" + activity.uv + "</td><td>" + activity.speed + "</td></tr>";
			if(activity.activityType === "Walking"){
				prepWalkingString += "<tr><td>" + "Date Needed" + "</td><td>" + activity.duration + "</td><td>" + "Calories Needed" + "</td><td>" + activity.uv + "</td><td>" + activity.speed + "</td></tr>";
				walkHasData = "data";
			}
			if(activity.activityType === "Running"){
				prepRunningString += "<tr><td>" + "Date Needed" + "</td><td>" + activity.duration + "</td><td>" + "Calories Needed" + "</td><td>" + activity.uv + "</td><td>" + activity.speed + "</td></tr>";
				runHasData = "data";
			}
			if(activity.activityType === "Biking"){
				prepBikingString += "<tr><td>" + "Date Needed" + "</td><td>" + activity.duration + "</td><td>" + "Calories Needed" + "</td><td>" + activity.uv + "</td><td>" + activity.speed + "</td></tr>";
				bikeHasData = "data";
			}
		}
		}
	if (walkHasData !== "data"){
				prepWalkingString = "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
			}
	if(runHasData !== "data"){
				prepRunningString = "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
			}			
	if(bikeHasData !== "data"){
				prepBikingString = "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
	}
	
   	$("#activityAllTableData").html(prepAllString);
	$("#activityWalkingTableData").html(prepWalkingString);
	$("#activityRunningTableData").html(prepRunningString);
	$("#activityBikingTableData").html(prepBikingString);
   	$("#error").hide();
	$("#main").show();
}

function activityInfoSuccess1(data, textStatus, jqXHR){
	var data1 = [];
	var i = 0;
	var emptyTable = false;
	for (var activity of data.activity) {
		if(activity.activityId === -1){
			emptyTable = true;
		}
		else{
		var tabledata = 
		{actType: activity.activityType, date: "date", duration: activity.duration, calories: "calories", uv: activity.uv, speed: activity.speed};
		}
		data1[i] = tabledata;
		i += 1;
	}	
	if(!emptyTable){
		var table = new Tabulator("#table-here", {
			height:"45vh",
			data:data1,
			responsiveLayout:"hide",
			layout:"fitColumns",
			columns:[
					{title:"Activity Type",field:"actType",align:"center"},
					{title:"Date of Activity",field:"date",align:"center"},
					{title:"Duration of Activity",field:"duration",align:"center"},
					{title:"Calories Burned",field:"calories",align:"center"},
					{title:"UV Index",field:"uv",align:"center"},
					{title:"Speed",field:"speed",align:"center"},
			],
			rowClick:function(e, row){ //trigger an alert message when the row is clicked
 				alert("Row " + row.getData().id + " Clicked!!!!");
 			},
		});
	$("#error").hide();
	$("#main").show();
	}
	else{
		var prepString = "<h3>There is currently no data for this device to display</h3>";
		$("#table-here").html(prepString);
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
function updateRadio(){
	var deviceNum = $("input[name='device']:checked").val();
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
	var deviceNum = $("input[name='device']:checked").val();
	sendReqForActivityInfo(deviceNum);
	}

   // Register event listeners
$("input[type='radio']").change(updateRadio);

$("#desiredDevice").change(function() { 
	var deviceNum = $("#desiredDevice").val(); 
	sendReqForActivityInfo(deviceNum);
});
	});
