document.addEventListener("DOMContentLoaded", function(){
	var signInButton = document.getElementById("signInButton");
	var signUpButton = document.getElementById("signUpButton");
	var signOutButton = document.getElementById("signout");
	var accountMenu = document.getElementById("navbarAccount");
	var activityMenu = document.getElementById("navbarActivity");
	
	if(!window.localStorage.getItem("authToken")){
		signInButton.classList.remove("d-none");
		signUpButton.classList.remove("d-none");
		signOutButton.classList.add("d-none");
		accountMenu.classList.add("d-none");
		activityMenu.classList.add("d-none");
	}
	else{
		document.getElementById("signInButton").classList.add("d-none");
		signUpButton.classList.add("d-none");
		signOutButton.classList.remove("d-none");
		accountMenu.classList.remove("d-none");	
		activityMenu.classList.remove("d-none");	
	}
});