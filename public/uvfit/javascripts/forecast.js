var i = 0;
function sendReqForForecastWeather() {
	var zip = $("#zip").val();
	var key = "069f328bfcad49e68de3f1d28f47730c";
	var units = "I";
	var days = 5;
	var card = "";
	var day = new Date().getDay();
   $.ajax({
      url: "https://api.weatherbit.io/v2.0/forecast/daily",
      jsonp: "callback",
      dataType: "jsonp",
      data: {postal_code: zip, units: units, key: key, days: days }
   }).done(function(data) {
	   	$("#zipEntered").html(zip);
	   $("#forecastCity").html(data.city_name);
	   
	   	for(var i=0; i < data.data.length; i++){
			if(i>0){
			day = 1 + day;
			if(day>6){day=0;};
			}
			
			card += "<div class=''><div class='days card shadow-lg mx-4 my-3' style='width: 18rem;''><div class='card-body' id='iconHere'><img class='card-img-top' src='https://www.weatherbit.io/static/img/icons/" + data.data[i].weather.icon + ".png' alt='Weather Image'><h5 class='card-title' id='date'>"  + dayOfWeek(day,i) + "</h5><span>" + data.data[i].valid_date +"</span><p class='card-text'>" + "<br>" + data.data[i].weather.description + "<br>Maximum Temperature: " + data.data[i].max_temp + " &deg;F<br>Minimum Temperature: " + data.data[i].min_temp + " &deg;F<br>UV Index: " + data.data[i].uv.toFixed(1) + "</p></div></div></div>";
     	}
	   $("#beforeThis").before(card);
   }).fail(function(jqXHR) {
      $("#error").html("Error retrieving the weather.");
   });
}
$(function() {
$("#hideMe").hide();
$("#pressZip").click(function(){
	$("#hideMe").show();
	$("#hideMe2").hide();
    var zip = $("#zip").val();
    sendReqForForecastWeather();
}); 
});

function dayOfWeek(dayOfWeek,first){
	var output = "";
	if(first === 0){
		output = "Today";
	}
	else if(dayOfWeek === 0)
	{
		output = "Sunday";
	}
	else if(dayOfWeek === 1){
		output = "Monday";
	}
	else if(dayOfWeek === 2){
		output = "Tuesday";
	}
	else if(dayOfWeek === 3){
		output = "Wednesday";
	}
	else if(dayOfWeek === 4){
		output = "Thursday";
	}
	else if(dayOfWeek === 5){
		output = "Friday";
	}
	else if(dayOfWeek === 6){
		output = "Saturday";
	}
	return output;
}