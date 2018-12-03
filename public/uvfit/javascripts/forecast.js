function sendReqForForecastWeather() {
	var zip = $("#zip").val();
   $.ajax({
      url: "http://api.openweathermap.org/data/2.5/forecast",
      jsonp: "callback",
      dataType: "jsonp",
      data: {zip: zip, units: "imperial", appid: "ceaff4ec24d67747b355a633bfa325f9" }
   }).done(function(data) {
	  $("#unixTime").html(data.list[0].dt_txt);
      $("#zipEntered").html(zip);
      $("#currentTemp").html(data.list[0].main.temp);
      $("#minTemp").html(data.list[0].main.temp_min);
      $("#maxTemp").html(data.list[0].main.temp_max);
	  $("#humidity").html(data.list[0].main.humidity);
   }).fail(function(jqXHR) {
      $("#error").html("Error retrieving the UV 1 weather.");
   });
}
function sendReqForNowWeather() {
	var zip = $("#zip").val();
   $.ajax({
      url: "http://api.openweathermap.org/data/2.5/weather",
      jsonp: "callback",
      dataType: "jsonp",
      data: {zip: zip, units: "imperial", appid: "ceaff4ec24d67747b355a633bfa325f9" }
   }).done(function(data) {
	   lat = data.coord.lat;
	  $("#unixTime1").html(data.dt);
      $("#currentTemp1").html(data.main.temp);
      $("#minTemp1").html(data.main.temp_min);
      $("#maxTemp1").html(data.main.temp_max);
   }).fail(function(jqXHR) {
      $("#error").html("Error retrieving the UV 2 weather.");
   });
}


$(function(){
	$("#pressZip").click(function(){
		sendReqForForecastWeather();
		sendReqForNowWeather();
		//sendReqForForecastUV();
		sendReqForNowUV();
	})
});

function sendReqForForecastUV(){
	var lat = 32.22;
	var lon = -110.926392;
	$.ajax({
      	url: "http://api.openweathermap.org/data/2.5/uvi/forecast",
      	jsonp: "callback",
      	dataType: "jsonp",
      	data: {lat: lat, lon: lon, cnt: 5, appid: "ceaff4ec24d67747b355a633bfa325f9" }
   	}).done(function(data) {
		$("#UVForecast").html(data[0].value);
   	}).fail(function(jqXHR) {
      		$("#error").html("Error retrieving the UV 3 weather.");
	});
	
}
function sendReqForNowUV(){
	var lat = "32.22";
	var lon = "-110.926392";
	$.ajax({
      	url: "http://api.openweathermap.org/data/2.5/uvi",
      	jsonp: "callback",
      	dataType: "jsonp",
      	data: {lat: lat, lon: lon, appid: "ceaff4ec24d67747b355a633bfa325f9" }
	}).done(function(data) {
		$("#UVNow").html(data);
	}).fail(function(jqXHR) {
		$("#error").html("Error retrieving the UV 4 weather.");
	});	
}