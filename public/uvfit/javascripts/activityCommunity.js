function getCoordinates(zipcode){
$.ajax({
  url: 'https://geocoder.api.here.com/6.2/geocode.json',
  type: 'GET',
  dataType: 'jsonp',
  jsonp: 'jsoncallback',
  data: {
    searchtext: zipcode + ' USA',
    app_id: 'nZc4mz1eOhPWxpoaexPX',
    app_code: 'ZQYM-bRmTUtvs85ho37uug',
    gen: '9'
  },
  success: function (data) {
    var location = data.Response.View[0].Result;
    var lat = location[0].Location.DisplayPosition.Latitude;
    var lng = location[0].Location.DisplayPosition.Longitude;
	postCoordinates(lat,lng);
	
  }
});
}

function postCoordinates(lat,lng){
	$.ajax({
        url: '/activity/local',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { centerLat: lat, centerLng: lng, miles: $("#mileRadius").val()}, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
           // Add new device to the device list
           $("#zipcode").val("");
			$("#localUserData").show();
		   $("#error").hide();
			
			//
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}
function buttonPress(){
	var enterZipcode = $("#zipcode").val();
	getCoordinates(enterZipcode);
}
function getAllUserData(){
	$.ajax({
      url: '/activity/location/' + actId,
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: function (data, textStatus, jqXHR) {
           // Add new device to the device list
           $("#activityCountAllAll").html(data.allActCount); 
		   $("#error").hide();
			
			//
        },
      error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
   });
}
//On page load
$(function(){
	$("#localUserData").hide();
	$("#submitButton").click(buttonPress);
});
