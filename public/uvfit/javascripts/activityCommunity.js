/*function geocodeAddress(geocoder) {
	var geocoder = new google.maps.Geocoder();
	console.log("button Pressed");
	var address = 85737;
	geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            var geocodedCoord = results[0].geometry.location;
			//console.log(String(geocodedCoord));
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
	
});
});*/
var mapData2 = {
    	lat: 33,
    	lng: -112
	};
$.ajax({
  url: 'https://geocoder.api.here.com/6.2/geocode.json',
  type: 'GET',
  dataType: 'jsonp',
  jsonp: 'jsoncallback',
  data: {
    searchtext: '85742 USA',
    app_id: 'nZc4mz1eOhPWxpoaexPX',
    app_code: 'ZQYM-bRmTUtvs85ho37uug',
    gen: '9'
  },
  success: function (data) {
    var location = data.Response.View[0].Result;
  	var mapData = {
    	lat: location[0].Location.DisplayPosition.Latitude,
    	lng: location[0].Location.DisplayPosition.Longitude
	};
	console.log(mapData);
	var answer = arePointsNear(mapData, mapData2, 150);
	console.log(answer);
  }
});
function arePointsNear(checkPoint, centerPoint, km) {
    var ky = 40000 / 360;
    var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
    var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= km;
}
//$(function(){
//$("#geocodeButton").click(fuction(){});
//});