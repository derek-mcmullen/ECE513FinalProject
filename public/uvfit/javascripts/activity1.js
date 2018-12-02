function sendReqForAccountInfo() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess,
      error: accountInfoError
   });
}
function accountInfoSuccess(data, textSatus, jqXHR) {
	var prepString = ""
	var i = 0;
   	for (var device of data.devices) {
		if(i===0){
	   		prepString +=  "<input type='radio' class='mx-2' id='" + device.deviceId + "' name='device' value='" + device.deviceId + "'>" + "<h4>" + device.deviceId + "</h4>";  
			i = 1;
		}
		else{
			prepString +=  "<input type='radio' class='mx-3' id='" + device.deviceId + "' name='device' value='" + device.deviceId + "'>" + "<h4>" + device.deviceId + "</h4>" ;
		}
	}	
	$("#populateMyDevices").html(prepString);
	
}
function accountInfoError(jqXHR, textStatus, errorThrown) {
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
//on page load
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("signin.html");
   }
	else{
		sendReqForAccountInfo();
	}
});