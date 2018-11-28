// JavaScript Document
$(function() {
   // If there's no authToken stored, redirect user to 
   // the sign-in page
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("signin.html");
   }
	else{
		console.log("Authenticated");
	}
});
