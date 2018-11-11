document.addEventListener("DOMContentLoaded", function() {
	var signInButton = document.getElementById("signInButton");
	var signUpButton = document.getElementById("signInButton");
	var signOutButton = document.getElementById("signInButton");
	var accountMenu = document.getElementById("navbarAccount");
	
	if(!window.localStorage.getItem("authToken")){
    	signInButton.classList.remove("sr-only");
		signUpButton.classList.remove("sr-only");
		signOutButton.classList.add("sr-only");
		accountMenu.classList.add("sr-only");
	}
	else{
    	signInButton.classList.add("sr-only");
		signUpButton.classList.add("sr-only");
		signOutButton.classList.remove("sr-only");
		accountMenu.classList.remove("sr-only");		
	}
});