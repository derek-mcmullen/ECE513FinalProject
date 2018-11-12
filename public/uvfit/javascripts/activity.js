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

function activityInfoSuccess(data, textSatus, jqXHR) {
   var prepString = ""; 

   if( !data.activity.length) { 
	prepString = "<li class='list-group-item'>No activity data for this device!"; 
   } else {  
   	var prepString = ""; 
    	for (var activity of data.activity) {
      		prepString += "<li class='list-group-item'>Speed: " + activity.speed + ", UV: " + activity.uv + ", Lat:  " + activity.latitude + ", Long: " + activity.longitude + "</li>"; 
    		
	}
   }

   $("#listItems").html(prepString); 
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

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("signin.html");
   }
   else {
      sendReqForActivityInfo();
   }
   
   // Register event listeners
   $("#desiredDevice").change(function() { 
	deviceNum = $("#desiredDevice").val(); 
	sendReqForActivityInfo(deviceNum); 
   }); 
});
