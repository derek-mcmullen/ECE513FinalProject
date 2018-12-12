var express = require('express');
var router = express.Router();
var request = require("request");
var jwt = require("jwt-simple"); 
var fs = require('fs');

// Import the model for Device documents
var Device = require("../models/device");
var Activity = require("../models/activity"); 

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();
var particleAccessToken = fs.readFileSync(__dirname + '/../../particle_access_token').toString();


// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 32; i++) {
       newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return newApikey;
}

// GET request all devices registered to the current user.
router.get('/email/:userId', function(req, res, next) {
    var userId = req.params.userId;
    var responseJson = { devices: [] };

    if (userId == "all") {
      var query = {};
    }
    else {
      var query = {
          "userEmail" : userId
      };
    }
    
    Device.find(query, function(err, allDevices) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
         for(var doc of allDevices) {
            responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact, "email" : doc.userEmail});
         }
      }
      res.status(200).json(responseJson);
    });
});


// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
    var deviceId = req.params.devid;
    var responseJson = { devices: [] };

    if (deviceId == "all") {
      var query = {};
    }
    else {
      var query = {
          "deviceId" : deviceId
      };
    }
    
    Device.find(query, function(err, allDevices) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
         for(var doc of allDevices) {
            responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
         }
      }
      res.status(200).json(responseJson);
    });
});

// Deletion endpoint for clearing out bad database data (will remove all corresponding activity data too)
router.post('/delete', function(req, res, next) {  
    Device.find({ deviceId: req.body.deviceId }).remove().exec(); 
	Activity.find({ deviceId: req.body.deviceId }).remove().exec(); 
    res.status(200).json({deleted:"yes"}); 
}); 


router.post('/register', function(req, res, next) {
    var responseJson = {
        registered: false,
        message : "",
        apikey : "none" 
    };
    var deviceExists = false;
	console.log("in the endpoint"); 

    // Ensure the request includes the deviceId parameter
    if( !req.body.deviceId ) {
        responseJson.message = "Missing deviceId.";
        res.status(400).json(responseJson);
        return;
    }
   
	var email = "";
	console.log(req.body);
    // If authToken provided, use email in authToken 
    if (req.headers["x-auth"]) {
			 
        try {

            var decodedToken = jwt.decode(req.headers["x-auth"], secret);
            email = decodedToken.email;
        }
        catch (ex) {
            responseJson.message = "Invalid authorization token.";
            return res.status(400).json(responseJson);
        }
    }
    else {
        // Ensure the request includes the email parameter
        if( !req.body.hasOwnProperty("email")) {
            responseJson.message = "Invalid authorization token or missing email address.";
            return res.status(400).json(responseJson);
        }
        email = req.body.email;
    }

    // See if device is already registered
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device !== null) {
            responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
            res.status(400).json(responseJson);
        }
        else {
            // Get a new apikey
	         deviceApikey = getNewApikey();
	         
	         // Create a new device with specified id, user email, and randomly generated apikey.
            var newDevice = new Device({
                deviceId: req.body.deviceId,
                userEmail: email,
                apikey: deviceApikey
            });

            // Save device. If successful, return success. If not, return error message.
            newDevice.save(function(err, newDevice) {
                if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    // This following is equivalent to:
                    //     res.status(400).send(JSON.stringify(responseJson));
                    res.status(400).json(responseJson);
                }
                else {
					request({
					    method: "POST",
					    uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/apiUpdate",
					    form: {
						   access_token : particleAccessToken,
						   apikey: deviceApikey
					    }
					});
					
                    responseJson.registered = true;
                    responseJson.apikey = deviceApikey;
                    responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
                    res.status(201).json(responseJson);
                }
            });
        }
    });
});

// update UV Threshold on device
router.post('/uvedit', function(req, res, next) {
		
    var responseJson = {
        success: false,
        message : "",
    };
    var deviceExists = false;
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }
	// Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("newUV")) {
        responseJson.message = "Missing UV Setting.";
        return res.status(400).json(responseJson);
    }
	
    
    // If authToken provided, use email in authToken 
/*     try {
        var decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    } */
    
    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/uvUpdate",
       form: {
	       access_token : particleAccessToken,
	       uvSetting: req.body.newUV
        }
    });
            
    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceId + " has updated its UV threshold.";
    return res.status(200).json(responseJson);
});

// update UV Threshold on device
router.post('/apiedit', function(req, res, next) {
		
    var responseJson = {
        success: false,
        message : "",
    };
    var deviceExists = false;
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }
	// Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("apikey")) {
        responseJson.message = "Missing API Key.";
        return res.status(400).json(responseJson);
    }
	
    
    // If authToken provided, use email in authToken 
/*     try {
        var decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    } */
    
    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/apiUpdate",
       form: {
	       access_token : particleAccessToken,
	       apikey: req.body.apikey
        }
    });
            
    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceId + " has updated its API key.";
    return res.status(200).json(responseJson);
});

module.exports = router;
