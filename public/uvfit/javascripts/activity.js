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

function activityInfoSuccess(data, textStatus, jqXHR) {
   	var prepAllString = "";
	var prepWalkingString = "";
	var prepRunningString = "";
	var prepBikingString = "";
	for (var activity of data.activity) {
   		if(activity.activityId === -1) { 
			prepAllString += "<tr><td valign='top' colspan='6' class='dataTables_empty'>This device currently has no data to show</td></tr>";
   		} 
		else {  
			prepAllString += "<tr><td>" + activity.activityType + "</td><td>" + "Date Needed" + "</td><td>" + activity.duration + "</td><td>" + "Calories Needed" + "</td><td>" + activity.uv + "</td><td>" + activity.speed + "</td></tr>";
		}
	}
   $("#activityAllTableData").html(prepAllString); 
   $("#error").hide();
	$("#main").show();
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
