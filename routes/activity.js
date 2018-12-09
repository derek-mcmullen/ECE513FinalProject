var express = require('express');
var router = express.Router(); 

// Import the model for Activity documents
var Activity = require("../models/activity"); 
var Device = require("../models/device"); 


// GET request return one or "all" activity data summarized 
router.get('/summary/:devid', function(req, res, next) {
    var deviceId = req.params.devid;
    var responseJson = { activity: [] };

    if (deviceId == "all") {
      var query = {};
    }
    else {
      var query = {
          "deviceId" : deviceId
      };
    }

    Activity.find(query, function(err, allActivity) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
		activityNum = -1; 
		devID = -1; 
		activityCount = 0;  
		avgSpeed = 0; 
		avgUV = 0;
		startTime = 999999999999; 
		stopTime = -1; 
		cals = 0; 

        for(var doc of allActivity) {

		// combine all returned data into activities
		if (doc.activityId == activityNum) { 
		    // accumulate data
		    avgSpeed += doc.speed; 
		    avgUV += doc.uv; 
		    activityCount++; 
			if (doc.timeStamp < startTime) { 
				startTime = doc.timeStamp; 
			} 
			if (doc.timeStamp >= stopTime) { 
				stopTime = doc.timeStamp; 
			}

		} else { 
		    if ( devID !== -1) { 
	     	// identify activity types, duration, average speed, calories burned, 
		    	avgSpeed = avgSpeed / activityCount; 
		    	avgUV = avgUV / activityCount; 
				duration = stopTime - startTime; 
				
				if (avgSpeed < 2) { 
					actType = "Walking"; 
					cals = duration * (5/60);
				} else if (avgSpeed < 6) { 
					actType = "Running"; 
					cals = duration * (20/60);
				} else { 
					actType = "Biking"; 
					cals = duration * (10/60);
				} 
			
			
				var date = new Date(startTime*1000);
				dateString = "" + (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear(); 
		    	// push data onto response
				responseJson.activity.push({ "deviceId": devID, "date":dateString, "activityId": activityNum, "duration" : duration, "activityType" : actType, "uv": avgUV, "speed": avgSpeed, "calories": cals});
		    }
		    // start a new activity
		    activityNum = doc.activityId; 
		    devID = doc.deviceId; 
		
			startTime = doc.timeStamp; 
			stopTime = doc.timeStamp; 
			
			avgSpeed = doc.speed; 
		    avgUV = doc.uv; 
		    activityCount = 1; 
		}
	 }
	
		// still need to post the final activity
		avgSpeed = (avgSpeed / activityCount); 
       	avgUV = (avgUV / activityCount); 
		duration = stopTime - startTime; 
		
		
		if (avgSpeed < 2) { 
			actType = "Walking"; 
			cals = duration * (5/60); 
		} else if (avgSpeed < 6) { 
			actType = "Running"; 
			cals = duration * (20/60); 
		} else { 
			actType = "Biking"; 
			cals = duration * (10/60); 
		} 
		
		var date = new Date(startTime*1000);
		dateString = "" + (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear(); 
		// push data onto response
		responseJson.activity.push({ "deviceId": devID, "date":dateString, "activityId": activityNum, "duration" : duration, "activityType" : actType, "uv": avgUV, "speed": avgSpeed, "calories": cals});
      }
      res.status(200).json(responseJson);
    }).sort({activityId:-1, timeStamp:1});    
 
});

// raw activity data
router.get('/raw', function(req, res, next) { 

    var responseJson = { activity: [] };
	var query = {};
	
	Activity.find(query, function(err, allActivity) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
		for(var doc of allActivity) {
			responseJson.activity.push({ doc });
		}
		res.status(200).json(responseJson);
	  }
	  
	}); 
}); 



// GET request return activity specific data and location parameters 
router.get('/location/:actid', function(req, res, next) {
    var activityId = req.params.actid;
    var responseJson = {};

    var query = {
       "activityId" : activityId 
    };

    Activity.find(query, function(err, allActivity) {
		if (err) {
			var errorMsg = {"message" : err};
				res.status(400).json(errorMsg);
			}
		else {
			activityCount = 0;  
			avgSpeed = 0; 
			avgUV = 0;
			startTime = 9999999999; 
			stopTime = -1; 

			for(var doc of allActivity) {
				activityNum = doc.activityId; 
			
				// accumulate data
				avgSpeed += doc.speed; 
				avgUV += doc.uv; 
				if (doc.speed != 0 && doc.latitude != 0 && doc.longitude != 0 ) { 
					activityCount++; 
				}
				if (doc.timeStamp < startTime && doc.timestamp != 0) { 
					startTime = doc.timeStamp; 
				} 
				if (doc.timeStamp >= stopTime && doc.timeStamp != 0) { 
					stopTime = doc.timeStamp; 
				}
			}

			avgSpeed = avgSpeed / activityCount; 
			avgUV = avgUV / activityCount; 
			duration = stopTime - startTime; 
			
			responseJson["activityId"] = activityNum; 
			responseJson["duration"] = duration; 
			responseJson["avgUV"] = avgUV; 
			responseJson["avgSpeed"] = avgSpeed; 
			responseJson["location"] = [];  


			 
			// push location data onto response
			for (var doc of allActivity) {
				if (doc.latitude == 0 || doc.longitude == 0) {
					// disregard
				} else {	
					latDecDegrees = Math.floor(doc.latitude/100); 
					latDecDegrees += ((doc.latitude/100 - latDecDegrees)/60)*100; 
					lngDecDegrees = Math.floor(doc.longitude/100); 
					lngDecDegrees += ((doc.longitude/100 - lngDecDegrees)/60)*100; 		
					
					responseJson.location.push({ "latitude" : latDecDegrees, "longitude": (-1*lngDecDegrees) });
				}
			}
		}
	res.status(200).json(responseJson);
    }).sort({timeStamp:1});    
 
});


// Deletion endpoint for clearing out bad database data
router.post('/delete', function(req, res, next) {  
    Activity.find({ deviceId: req.body.deviceId }).remove().exec(); 
    res.status(200).json({deleted:"yes"}); 
}); 

router.post('/update', function(req, res, next) { 
    var responseJson = {
        logged: false,
        message : "",
    };

    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        res.status(400).json(responseJson);
        return;
    }
   
    // See if device is registered
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device !== null) {
	    
		// log this activity if API key matches
		var js; 
		var obj; 
		var stringify; 
		
		if (req.body.hasOwnProperty("data") ) { 
			js = req.body.data;
			//stringify = JSON.stringify(js); 
			obj = JSON.parse(js);
		}
		if (req.body.hasOwnProperty("data2") ) { 
			js = JSON.stringify(req.body.data2);
		    obj = JSON.parse(js); 
		} 
		
		// TODO: check the API key
	
		 /* To help save space in the string we use the following encoding:
             a) longitude
             b) latitude
             c) speed
             d) UV reading
             i) Activity ID
             t) Unix timestamp
             k) API key
          */
		// Create a new activity with specified id, times, and sensor info values.
            var newActivity = new Activity({
                deviceId: req.body.deviceId,
				activityId: obj.i, 					//req.body.activityId,
				timeStamp: obj.t, 					//req.body.timeStamp,
                latitude: obj.b,					//req.body.latitude,
                longitude: obj.a, 					//req.body.longitude, 
				speed: obj.c, 						//req.body.speed, 
				uv: obj.d							//req.body.uv
            });
		
	
 	    // Save activity. If successful, return success. If not, return error message.
            newActivity.save(function(err, newActivity) {
                if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    res.status(400).json(responseJson);
                }
                else {
	   	    responseJson.logged = true; 
            	    responseJson.message = "Activity update logged";
            	    res.status(200).json(responseJson);
                }
            });
        }
        else {
            // device not registered so ignore the update

            responseJson.message = "DeviceID is not registered";
            res.status(400).json(responseJson);
        }
    });
});

// GET request return all activity data summarized for ALL USERS
router.get('/allUsers', function(req, res, next) {
    var responseJson = { 	allActCount: 0,
							allDistance: 0,
							allCalories: 0, 
							allUV: 0, 
							walkActCount: 0, 
							walkDistance: 0, 
							walkCalories: 0,
							walkUV: 0, 
							runActCount: 0, 
							runDistance: 0, 
							runCalories: 0, 
							runUV: 0, 
							bikeActCount: 0, 
							bikeDistance: 0, 
							bikeCalories: 0, 
							bikeUV: 0 };

    var query = {};

    Activity.find(query, function(err, allActivity) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
		activityNum = -1; 
		devID = -1; 
		activityCount = 0;  
		avgSpeed = 0; 
		avgUV = 0;
		prevLat = 0; 
		prevLng = 0; 
		actDist = 0; 
		startTime = 999999999999; 
		stopTime = -1; 
		cals = 0; 
		
		totCount = 0; 
		totCals = 0; 
		totUV = 0; 
		totDist = 0; 
		wkCount = 0; 
		wkCals = 0; 
		wkUV = 0; 
		wkDist = 0; 
		rnCount = 0; 
		rnCals = 0; 
		rnUV = 0; 
		rnDist = 0; 
		bkCount = 0; 
		bkCals = 0; 
		bkUV = 0; 
		bkDist = 0; 

        for(var doc of allActivity) {

		// combine all returned data into activities
		if (doc.activityId == activityNum) { 
		    // accumulate data
		    avgSpeed += doc.speed; 
		    avgUV += doc.uv; 
			actDist += calcCrow(prevLat, prevLng, doc.latitude, doc.longitude); 
			prevLat = doc.latitude; 
			prevLng = doc.longitude; 
		    activityCount++; 
			if (doc.timeStamp < startTime) { 
				startTime = doc.timeStamp; 
			} 
			if (doc.timeStamp >= stopTime) { 
				stopTime = doc.timeStamp; 
			}

		} else { 
		    if ( devID !== -1) { 
	     	// identify activity types, duration, average speed, calories burned, 
		    	avgSpeed = avgSpeed / activityCount; 
		    	avgUV = avgUV / activityCount; 
				duration = stopTime - startTime; 
				
				if (avgSpeed < 2) { 
					actType = "Walking"; 
					cals = duration * (5/60);
					totCount++; 
					totCals += cals; 
					totUV += avgUV; 
					totDist += actDist; 
					wkCount++; 
					wkCals += cals; 
					wkUV += avgUV; 
					wkDist += actDist; 
				} else if (avgSpeed < 6) { 
					actType = "Running"; 
					cals = duration * (20/60);
					totCount++; 
					totCals += cals; 
					totUV += avgUV; 
					totDist += actDist; 
					rnCount++; 			
					rnCals += cals; 
					rnUV += avgUV; 
					rnDist += actDist; 
				} else { 
					actType = "Biking"; 
					cals = duration * (10/60);
					totCount++; 
					totCals += cals; 
					totUV += avgUV; 
					totDist += actDist; 
					bkCount++; 
					bkCals += cals; 
					bkUV += avgUV; 
					bkDist += actDist; 
				} 
				
				actDist = 0; 			
				
			
		    	// push data onto response
				//responseJson.activity.push({ "deviceId": devID, "activityId": activityNum, "duration" : duration, "activityType" : actType, "uv": avgUV, "speed": avgSpeed, "calories": cals});
			
			}
		    // start a new activity
		    activityNum = doc.activityId; 
		    devID = doc.deviceId; 
			startTime = doc.timeStamp; 
			stopTime = doc.timeStamp; 
			
			
			// if (doc.timeStamp < startTime) { 
				// startTime = doc.timeStamp; 
			// } 
			// if (doc.timeStamp >= stopTime) { 
				// stopTime = doc.timeStamp; 
			// }

			avgSpeed = doc.speed; 
		    avgUV = doc.uv; 
			prevLat = doc.latitude; 
			prevLng = doc.longitude; 
		    activityCount = 1; 
		}
	 }
	
		// still need to post the final activity
		avgSpeed = avgSpeed / activityCount; 
       	avgUV = avgUV / activityCount; 
		duration = stopTime - startTime; 
		
		
		if (avgSpeed < 2) { 
			actType = "Walking"; 
			cals = duration * (5/60); 
			totCount++; 
			totCals += cals; 
			totUV += avgUV; 
			totDist += actDist; 
			wkCount++; 	
			wkCals += cals; 
			wkUV += avgUV; 
			wkDist += actDist; 
		} else if (avgSpeed < 6) { 
			actType = "Running"; 
			cals = duration * (20/60);
			totCount++; 
			totCals += cals; 
			totUV += avgUV; 
			totDist += actDist; 
			rnCount++; 			
			rnCals += cals; 
			rnUV += avgUV; 
			rnDist += actDist; 
		} else { 
			actType = "Biking"; 
			cals = duration * (10/60); 
			totCount++; 
			totCals += cals; 
			totUV += avgUV; 
			totDist += actDist; 
			bkCount++; 
			bkCals += cals; 
			bkUV += avgUV; 
			bkDist += actDist; 
		} 

		actDist = 0; 
		responseJson.allActCount = totCount; 
		responseJson.allCalories = (totCals / totCount).toFixed(0); 
		responseJson.allUV = (totUV / totCount).toFixed(1); 
		responseJson.allDistance = ((totDist / totCount)*1000).toFixed(2); 
		
		responseJson.walkActCount = wkCount; 
		responseJson.walkCalories = (wkCals / wkCount).toFixed(0); 
		responseJson.walkUV = (wkUV / wkCount).toFixed(1); 
		responseJson.walkDistance = ((wkDist / wkCount)*1000).toFixed(2); 
		
		responseJson.runActCount = rnCount; 
		responseJson.runCalories = (rnCals / rnCount).toFixed(0); 
		responseJson.runUV = (rnUV / rnCount).toFixed(1); 
		responseJson.runDistance = ((rnDist / rnCount)*1000).toFixed(2); 
		
		responseJson.bikeActCount = bkCount; 
		responseJson.bikeCalories = (bkCals / bkCount).toFixed(0); 
		responseJson.bikeUV = (bkUV / bkCount).toFixed(1); 
		responseJson.bikeDistance = ((bkDist / bkCount)*1000).toFixed(2); 
				
		// push data onto response
		//responseJson.activity.push({ "deviceId": devID, "activityId": activityNum, "duration" : duration, "activityType" : actType, "uv": avgUV, "speed": avgSpeed, "calories": cals});
      }
      res.status(200).json(responseJson);
    }).sort({activityId:-1, timeStamp:1});    
});

// POST request return one or "all" activity data summarized 
router.post('/local', function(req, res, next) {
	
	var centerLat = req.body.centerLat;
	var centerLng = req.body.centerLng;  
	var radiusKm = req.body.miles * 1.60934; 
	
    var responseJson = { 	allActCount: 0,
							allDistance: 0,
							allCalories: 0, 
							allUV: 0, 
							walkActCount: 0, 
							walkDistance: 0, 
							walkCalories: 0,
							walkUV: 0, 
							runActCount: 0, 
							runDistance: 0, 
							runCalories: 0, 
							runUV: 0, 
							bikeActCount: 0, 
							bikeDistance: 0, 
							bikeCalories: 0, 
							bikeUV: 0 };

    var query = {};

    Activity.find(query, function(err, allActivity) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
		activityNum = -1; 
		devID = -1; 
		activityCount = 0;  
		avgSpeed = 0; 
		avgUV = 0;
		prevLat = 0; 
		prevLng = 0; 
		actDist = 0; 
		startTime = 999999999999; 
		stopTime = -1; 
		cals = 0; 
		
		totCount = 0; 
		totCals = 0; 
		totUV = 0; 
		totDist = 0; 
		wkCount = 0; 
		wkCals = 0; 
		wkUV = 0; 
		wkDist = 0; 
		rnCount = 0; 
		rnCals = 0; 
		rnUV = 0; 
		rnDist = 0; 
		bkCount = 0; 
		bkCals = 0; 
		bkUV = 0; 
		bkDist = 0; 

        for(var doc of allActivity) {

		// combine all returned data into activities
		if (doc.activityId == activityNum) { 
		    // accumulate data
		    avgSpeed += doc.speed; 
		    avgUV += doc.uv; 
			actDist += calcCrow(prevLat, prevLng, doc.latitude, doc.longitude); 
			prevLat = doc.latitude; 
			prevLng = doc.longitude; 
		    activityCount++; 
			if (doc.timeStamp < startTime) { 
				startTime = doc.timeStamp; 
			} 
			if (doc.timeStamp >= stopTime) { 
				stopTime = doc.timeStamp; 
			}

		} else { 
		    if ( devID !== -1) { 
	     	// identify activity types, duration, average speed, calories burned, 
		    	avgSpeed = avgSpeed / activityCount; 
		    	avgUV = avgUV / activityCount; 
				duration = stopTime - startTime; 
				
				if (arePointsNear( {"lat":centerLat, "lng":centerLng}, {"lat":prevLat, "lng":prevLng}, radiusKm) ) {
					if (avgSpeed < 2) { 
						actType = "Walking"; 
						cals = duration * (5/60);
						totCount++; 
						totCals += cals; 
						totUV += avgUV; 
						totDist += actDist; 
						wkCount++; 
						wkCals += cals; 
						wkUV += avgUV; 
						wkDist += actDist; 
					} else if (avgSpeed < 6) { 
						actType = "Running"; 
						cals = duration * (20/60);
						totCount++; 
						totCals += cals; 
						totUV += avgUV; 
						totDist += actDist; 
						rnCount++; 			
						rnCals += cals; 
						rnUV += avgUV; 
						rnDist += actDist; 
					} else { 
						actType = "Biking"; 
						cals = duration * (10/60);
						totCount++; 
						totCals += cals; 
						totUV += avgUV; 
						totDist += actDist; 
						bkCount++; 
						bkCals += cals; 
						bkUV += avgUV; 
						bkDist += actDist; 
					} 
				}
				actDist = 0; 			
			}
		    // start a new activity
		    activityNum = doc.activityId; 
		    devID = doc.deviceId; 
			startTime = doc.timeStamp; 
			stopTime = doc.timeStamp; 
			avgSpeed = doc.speed; 
		    avgUV = doc.uv; 
			prevLat = doc.latitude; 
			prevLng = doc.longitude; 
		    activityCount = 1; 
		}
	 }
	
		// still need to post the final activity
		avgSpeed = avgSpeed / activityCount; 
       	avgUV = avgUV / activityCount; 
		duration = stopTime - startTime; 
		
		if ( arePointsNear({"lat":prevLat, "lng":prevLng},{"lat":centerLat, "lng":centerLng},radiusKm) ) {
			if (avgSpeed < 2) { 
				actType = "Walking"; 
				cals = duration * (5/60); 
				totCount++; 
				totCals += cals; 
				totUV += avgUV; 
				totDist += actDist; 
				wkCount++; 	
				wkCals += cals; 
				wkUV += avgUV; 
				wkDist += actDist; 
			} else if (avgSpeed < 6) { 
				actType = "Running"; 
				cals = duration * (20/60);
				totCount++; 
				totCals += cals; 
				totUV += avgUV; 
				totDist += actDist; 
				rnCount++; 			
				rnCals += cals; 
				rnUV += avgUV; 
				rnDist += actDist; 
			} else { 
				actType = "Biking"; 
				cals = duration * (10/60); 
				totCount++; 
				totCals += cals; 
				totUV += avgUV; 
				totDist += actDist; 
				bkCount++; 
				bkCals += cals; 
				bkUV += avgUV; 
				bkDist += actDist; 
			} 
		}

		actDist = 0; 
		responseJson.allActCount = totCount; 
		responseJson.allCalories = (totCals / totCount).toFixed(0); 
		responseJson.allUV = (totUV / totCount).toFixed(1); 
		responseJson.allDistance = ((totDist / totCount)*1000).toFixed(2); 
		
		responseJson.walkActCount = wkCount; 
		responseJson.walkCalories = (wkCals / wkCount).toFixed(0); 
		responseJson.walkUV = (wkUV / wkCount).toFixed(1); 
		responseJson.walkDistance = ((wkDist / wkCount)*1000).toFixed(2); 
		
		responseJson.runActCount = rnCount; 
		responseJson.runCalories = (rnCals / rnCount).toFixed(0); 
		responseJson.runUV = (rnUV / rnCount).toFixed(1); 
		responseJson.runDistance = ((rnDist / rnCount)*1000).toFixed(2); 
		
		responseJson.bikeActCount = bkCount; 
		responseJson.bikeCalories = (bkCals / bkCount).toFixed(0); 
		responseJson.bikeUV = (bkUV / bkCount).toFixed(1); 
		responseJson.bikeDistance = ((bkDist / bkCount)*1000).toFixed(2); 
				
		// push data onto response
		//responseJson.activity.push({ "deviceId": devID, "activityId": activityNum, "duration" : duration, "activityType" : actType, "uv": avgUV, "speed": avgSpeed, "calories": cals});
      }
      res.status(200).json(responseJson);
    }).sort({activityId:-1, timeStamp:1});    
});

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) 
{
	var R = 6371; // km
	var dLat = toRad(lat2-lat1);
	var dLon = toRad(lon2-lon1);
	var lat1 = toRad(lat1);
	var lat2 = toRad(lat2);

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
	return Value * Math.PI / 180;
}

function arePointsNear(checkPoint, centerPoint, km) {

	latDecDegrees = Math.floor(checkPoint.lat/100); 
	latDecDegrees += ((checkPoint.lat/100 - latDecDegrees)/60)*100; 
	lngDecDegrees = Math.floor(checkPoint.lng/100); 
	lngDecDegrees += ((checkPoint.lng/100 - lngDecDegrees)/60)*100; 	
	
	console.log("lat: " + latDecDegrees); 
	console.log("lng: " + lngDecDegrees); 
	
    var ky = 40000 / 360;
    var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
    var dx = Math.abs(centerPoint.lng - lngDecDegrees) * kx;
    var dy = Math.abs(centerPoint.lat - latDecDegrees) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= km;
}


module.exports = router;
