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
			
		    	// push data onto response
				responseJson.activity.push({ "deviceId": devID, "activityId": activityNum, "duration" : duration, "activityType" : actType, "uv": avgUV, "speed": avgSpeed, "calories": cals});
		    }
		    // start a new activity
		    activityNum = doc.activityId; 
		    devID = doc.deviceId; 
			
			if (doc.timeStamp < startTime) { 
				startTime = doc.timeStamp; 
			} 
			if (doc.timeStamp >= stopTime) { 
				stopTime = doc.timeStamp; 
			}

			avgSpeed = doc.speed; 
		    avgUV = doc.uv; 
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
		} else if (avgSpeed < 6) { 
			actType = "Running"; 
			cals = duration * (20/60); 
		} else { 
			actType = "Biking"; 
			cals = duration * (10/60); 
		} 

		// push data onto response
		responseJson.activity.push({ "deviceId": devID, "activityId": activityNum, "duration" : duration, "activityType" : actType, "uv": avgUV, "speed": avgSpeed, "calories": cals});
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
				activityCount++; 
				
				if (doc.timeStamp < startTime) { 
					startTime = doc.timeStamp; 
				} 
				if (doc.timeStamp >= stopTime) { 
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
				responseJson.location.push({ "latitude" : doc.latitude, "longitude": doc.longitude });
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
	
	console.log(req.body.data2); 

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
		
		if (req.body.hasOwnProperty("data") ) { 
			js = req.body.data;
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

module.exports = router;
