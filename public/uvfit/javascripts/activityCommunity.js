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
	console.log(lat);
	console.log(lng);
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
			var radius = $("#mileRadius").val();
			console.log(radius);
		  if((data.walkActCount >= data.runActCount) && (data.walkActCount >= data.bikeActCount)){
			  var mostPopular = "walking";
		  }
		  else if((data.runActCount >= data.walkActCount) && (data.runActCount >= data.bikeActCount)){
			  var mostPopular = "running";
		  }
		  else if((data.bikeActCount >= data.runActCount) && (data.bikeActCount >= data.walkActCount)){
			  var mostPopular = "biking";
		  }
           var enteredZip = $("#zipcode").val();
		   $("#localUserData").show();
		   
		   $("#zipcodeLocal").html(enteredZip);
		   $("#mostPopularLocal").html(mostPopular);
		   $("#activityCountAllLocal").html(data.allActCount);
		   $("#averageDistanceAllLocal").html(data.allDistance);
		   $("#averageCaloriesAllLocal").html(data.allCalories);
		   $("#averageUVAllLocal").html(data.allUV);
		   
		   $("#cardActivityAll").html(data.allActCount);
		   $("#cardDistanceAll").html(data.allDistance);
		   $("#cardCaloriesAll").html(data.allCalories);
		   $("#cardUVAll").html(data.allUV);
		  
		   $("#cardActivityWalking").html(data.walkActCount);
		   $("#cardDistanceWalking").html(data.walkDistance);
		   $("#cardCaloriesWalking").html(data.walkCalories);
		   $("#cardUVWalking").html(data.walkUV);
		  
		   $("#cardActivityRunning").html(data.runActCount);
		   $("#cardDistanceRunning").html(data.runDistance);
		   $("#cardCaloriesRunning").html(data.runCalories);
		   $("#cardUVRunning").html(data.runUV);
		  
		   $("#cardActivityBiking").html(data.bikeActCount);
		   $("#cardDistanceBiking").html(data.bikeDistance);
		   $("#cardCaloriesBiking").html(data.bikeCalories);
		   $("#cardUVBiking").html(data.bikeUV);
		   $("#zipcode").val("");
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
      url: '/activity/allUsers',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: function (data, textStatus, jqXHR) {
           // Add new device to the device list
		  if((data.walkActCount >= data.runActCount) && (data.walkActCount >= data.bikeActCount)){
			  var mostPopular = "walking";
		  }
		  else if((data.runActCount >= data.walkActCount) && (data.runActCount >= data.bikeActCount)){
			  var mostPopular = "running";
		  }
		  else if((data.bikeActCount >= data.runActCount) && (data.bikeActCount >= data.walkActCount)){
			  var mostPopular = "biking";
		  }
		   $("#mostPopularAll").html(mostPopular);
		   $("#activityCountAllAll").html(data.allActCount);
		   $("#averageDistanceAllAll").html(data.allDistance);
		   $("#averageCaloriesAllAll").html(data.allCalories);
		   $("#averageUVAllAll").html(data.allUV);
		   
		   $("#cardActivityAllAll").html(data.allActCount);
		   $("#cardDistanceAllAll").html(data.allDistance);
		   $("#cardCaloriesAllAll").html(data.allCalories);
		   $("#cardUVAllAll").html(data.allUV);
		  
		   $("#cardActivityWalkingAll").html(data.walkActCount);
		   $("#cardDistanceWalkingAll").html(data.walkDistance);
		   $("#cardCaloriesWalkingAll").html(data.walkCalories);
		   $("#cardUVWalkingAll").html(data.walkUV);
		  
		   $("#cardActivityRunningAll").html(data.runActCount);
		   $("#cardDistanceRunningAll").html(data.runDistance);
		   $("#cardCaloriesRunningAll").html(data.runCalories);
		   $("#cardUVRunningAll").html(data.runUV);
		  
		   $("#cardActivityBikingAll").html(data.bikeActCount);
		   $("#cardDistanceBikingAll").html(data.bikeDistance);
		   $("#cardCaloriesBikingAll").html(data.bikeCalories);
		   $("#cardUVBikingAll").html(data.bikeUV);
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
	getAllUserData();
	$("#submitButton").click(buttonPress);
});
