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
   $("#email").html(data.email);
   $("#fullName").html(data.fullName);
   $("#lastAccess").html(data.lastAccess);
   // Add the devices to the list before the list item for the add device button (link)
   for (var device of data.devices) {
      $("#removeDeviceControl").before("<li class='list-group-item' id ='addedDevice'>ID: " +
        device.deviceId + ", APIKEY: " + device.apikey + "<a class='d-none btn-danger Remove ml-3' href='#!' id='removeId'>Remove Device</a>" + 
		"</li>")
   }
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

// Registers the specified device with the server.
function registerDevice() {
    $.ajax({
        url: '/devices/register',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { deviceId: $("#deviceId").val(), 
		email: $("#email").val() }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
           // Add new device to the device list
           $("#removeDeviceControl").before("<li class='list-group-item'>ID: " +
           $("#deviceId").val() + ", APIKEY: " + data["apikey"] + "<a class='d-none btn-danger Remove ml-3' href='#!' id='removeId'>Remove Device</a>" + "</li>")
           $("#deviceId").val("");
		   $("#error").hide();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
   $("#deviceId").val("");           // Clear the input for the device ID
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
   $("#addDeviceControl").show();  // Hide the add device link
   $("#addDeviceForm").slideUp();  // Show the add device form
   $("#error").hide();
}

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("signin.html");
   }
   else {
      sendReqForAccountInfo();
   }
   
   // Register event listeners
   	$("#registerDevice").click(registerDevice);
	$("#removeDevice").click(function(){
      	$(".Remove").removeClass("d-none");
		$("#cancelRemove").removeClass("d-none");
		$("#removeDevice").addClass("d-none");
    });
	
	$("#cancelRemove").click(function(){
      	$(".Remove").addClass("d-none");
		$("#cancelRemove").addClass("d-none");
		$("#removeDevice").removeClass("d-none");
    });
});
