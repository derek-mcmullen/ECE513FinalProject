var express = require('express');
var router = express.Router();
var fs = require('fs');
var User = require("../models/users");
var Device = require("../models/device");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

var nodemailer = require('nodemailer'); 

var gmail = fs.readFileSync(__dirname + '/../../gmail').toString(); 

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'uvfit513@gmail.com',
        pass: gmail
    }
});

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.post('/signin', function(req, res, next) {
   User.findOne({email: req.body.email}, function(err, user) {
      if (err) {
         res.status(401).json({success : false, error : "Error communicating with database."});
      }
      else if(!user) {
         res.status(401).json({success : false, error : "The email or password provided was invalid."});         
      }
      else {
         bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
            if (err) {
               res.status(401).json({success : false, error : "Error authenticating. Please contact support."});
            }
            else if(valid) {
			   var token = jwt.encode({email: req.body.email}, secret); 
               res.status(201).json({success : true, token : token});         
            }
            else {
               res.status(401).json({success : false, error : "The email or password provided was invalid."});         
            }
         });
      }
   });
});

/* Register a new user */
router.post('/register', function(req, res, next) {

    bcrypt.hash(req.body.password, null, null, function(err, hash) {
        // Create an entry for the user
        var newUser = new User( {
           email: req.body.email,
           fullName: req.body.fullName,
           passwordHash: hash // hashed password
        }); 
        
        newUser.save( function(err, user) {
           if (err) {
              // Error can occur if a duplicate email is sent
              res.status(400).json( {success: false, message: "This email is already taken"});
           }
           else {
				
				
				var emailMsg = '<p>Click the link below to complete email verification</p>';
				    emailMsg += '<p>https://uvfit513.duckdns.org/users/verify/'+ newUser.email + '</p>'; 
				
				var mailOptions = {
				from: '"UVFit Team" <no-reply@uvfit513@gmail.com>',
				to: newUser.email,
				subject: 'Verify Your Email',
				html: emailMsg };
				
				transporter.sendMail(mailOptions, function (err, info) {				
					if(err){ 
						console.log(err);
					} else { 
						 console.log(info);
					}
				}); 			
				setTimeout(function() { 
					User.find({ verified: false , createdOn: {$lt : (Date.now() - 1000*60*60)}}).remove().exec(); 
				}, 60*60*1000); //one hour in millis
				res.status(201).json( {success: true, message: user.fullName + " has been created."}); 
           
		   }
        });
    });    
});

router.get("/verify/:email", function(req,res) { 
	
	User.findOne({email: req.params.email}, function(err, user) {
         if(err) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
			  
			User.updateOne({ email: req.params.email }, { verified: true }, function(err, res) {
				// Updated at most one doc, `res.modifiedCount` contains the number
				// of docs that MongoDB updated
			});  
			res.redirect("https://uvfit513.duckdns.org/uvfit/emailVerify.html"); 
            //return res.status(200).json({success: true, message: "Your email has been verified!"});            
		 }
      });
}); 

router.post("/update", function(req, res) { 
	//req.body.name
	// Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }

   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
			if (req.body.password ) {
				if (user.email == req.body.email) { 
					bcrypt.hash(req.body.password, null, null, function(err, hash) {
					
					// change password and name field 
						User.updateOne({ email: decodedToken.email }, { fullName: req.body.name, passwordHash: hash }, function(err, res) {
							// Updated at most one doc, `res.modifiedCount` contains the number
							// of docs that MongoDB updated
						}); 
					}); 
					return res.status(203).json({success: true, message: "User's password has been updated"}); 
				} else { 
					bcrypt.hash(req.body.password, null, null, function(err, hash) {
					// change password and email field 
						User.updateOne({ email: decodedToken.email }, { email: req.body.email, fullName: req.body.name, passwordHash: hash }, function(err, res) {
							// Updated at most one doc, `res.modifiedCount` contains the number
							// of docs that MongoDB updated
						}); 
					});
					return res.status(202).json({success: true, message: "User's email and password have been updated"}); 
				}
			} else {
				if (user.email == req.body.email )  { 
					// only updating name
					User.updateOne({ email: decodedToken.email }, { fullName: req.body.name }, function(err, res) {
						// Updated at most one doc, `res.modifiedCount` contains the number
						// of docs that MongoDB updated
					});
					return res.status(200).json({success: true, message: "User's name has been updated"});            
				} else { 
					// updating email and name
					User.updateOne({ email: decodedToken.email }, { email: req.body.email, fullName: req.body.name }, function(err, res) {
						// Updated at most one doc, `res.modifiedCount` contains the number
						// of docs that MongoDB updated
					});
					
					// new email verification
					var emailMsg = '<p>Click the link below to complete email verification</p>';
				    emailMsg += '<p>https://uvfit513.duckdns.org/users/verify/'+ req.body.email + '</p>'; 
				
					var mailOptions = {
					from: '"UVFit Team" <no-reply@uvfit513@gmail.com>',
					to: req.body.email,
					subject: 'Verify Your Email',
					html: emailMsg };
					
					transporter.sendMail(mailOptions, function (err, info) {				
						if(err){ 
							console.log(err);
						} else { 
							 console.log(info);
						}
					}); 			
					setTimeout(function() { 
						User.find({ verified: false , createdOn: {$lt : (Date.now() - 1000*60*60)}}).remove().exec(); 
					}, 60*60*1000); //one hour in millis

					return res.status(201).json({success: true, message: "User's email has been updated"});            
				}
				
			} 				
            return res.status(200).json({success: true, message: "User's name has been updated"});            
         } 
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
	
	
}); 

router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
			 
			// update last accessed 
			var time = (new Date()).getTime(); 
			User.updateOne({ email: decodedToken.email }, { lastAccess: time }, function(err, res) {
				// Updated at most one doc, `res.modifiedCount` contains the number
				// of docs that MongoDB updated
			}); 
			 
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
			userStatus['uv'] = user.UVThreshold; 
            
            // Find devices based on decoded token
		      Device.find({ userEmail : decodedToken.email}, function(err, devices) {
			      if (!err) {
			         // Construct device list
			         var deviceList = []; 
			         for (device of devices) {
				         deviceList.push({  
				               deviceId: device.deviceId,
				               apikey: device.apikey,
				         });
			         }
			         userStatus['devices'] = deviceList;
			      }
			      
               return res.status(200).json(userStatus);            
		      });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

router.get("/uv/:uvNum" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
			 
			User.updateOne({ email: decodedToken.email }, { UVThreshold: req.params.uvNum }, function(err, res) {
				// Updated at most one doc, `res.modifiedCount` contains the number
				// of docs that MongoDB updated
			}); 
           
            return res.status(200).json({success: true, message: "UV value updated"});            
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

module.exports = router;
