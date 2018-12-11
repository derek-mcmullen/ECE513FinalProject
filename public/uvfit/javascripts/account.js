function postAccountUpdate(userData){
	$.ajax({
        url: '/users/update',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: userData, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
			if(jqXHR.status === 203){ //This is for if the password is updated
				$("#error").hide();
				window.localStorage.removeItem("authToken");
      			window.location = "signin.html";
			}
			if(jqXHR.status === 201){ //This is for if the email is updated
				$("#error").hide();
				window.localStorage.removeItem("authToken");
      			window.location = "emailVerifyNeeded.html"; 
			}
			if(jqXHR.status === 200){ //This is for if Name is updated
				$("#error").hide();
				location.reload(true);
			}
			if(jqXHR.status === 202){ //If username and Password is changed
				$("#error").hide();
				window.localStorage.removeItem("authToken");
      			window.location = "emailVerifyNeeded.html"; 
			}
			
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}
// Get the modal1
var modal1 = document.getElementById("myModal1");
// Get the button that opens the modal
var btn1 = document.getElementById("accountUpdate");
// Get the modal
var modal = document.getElementById("myModal");
// Get the button that opens the modal
var btn = document.getElementById("UVInfoButton");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks the button, open the modal 

$('#accountUpdate').click(function(){
	//var currentName = $("#fullName").val();
	var currentName = $("span").find("#fullName").val();
	//console.log(currentName);
	$("#changeName").val(currentName);
	modal1.style.display = "block";
});
$('.close').click(function(){
	modal1.style.display = "none";
});
// When the user clicks the button, open the modal 
$('#UVInfoButton').click(function(){
	modal.style.display = "block";
});
$('.close').click(function(){
	modal.style.display = "none";
});
// When the user clicks anywhere outside of the modal, close it
$(window).click(function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});
/*$('#submitUpdate').click(function(){
	var name = $("#newName").val();
	//console.log(name);
	postAccountUpdate(name);
});*/
$(function() { 
	$("#UVThreshold").on("input change", function () {
		$("#updateThreshold").css("display", "block");
	});
	$("#updateThreshold").click(function() { 
		$.ajax({
			url: '/devices/uvedit',
			type: 'POST',
			headers: { 'x-auth': window.localStorage.getItem("authToken") },
			data: { deviceId: "31002b000747363339343638", 
					newUV: (1000 - $("#UVThreshold").val()) }, 
			responseType: 'json',
			success: uvSuccess,
			error: uvError
		});
		$.ajax({
			url: '/users/uv/' + $("#UVThreshold").val(),
			type: 'GET',
			headers: { 'x-auth': window.localStorage.getItem("authToken") },
			responseType: 'json',
			success: uvSuccess,
			error: uvError
		});		
	}); 
}); 

function uvSuccess() { 
	console.log("success"); 
}

function uvError() { 
	console.log("failure"); 
} 

//NEW Functions
$('#submitUpdate').click(function(){
	var name = $("#newName").val();
	var email = $("#newEmail").val();
	var password = $("#newPassword").val();
	var passwordConfirm = $("#newPasswordConfirm").val();
	var currentName = $("span").find("#fullName").val();
	var currentEmail = $("span").find("#email").val();
	var newData = {};
	var passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;
	var fullNameRe = /\w+/;
  	var emailRe = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
	var errorString = "";
	if(password !== passwordConfirm){
		errorString += "<li>This password does not match</li>"
	}
	if(!fullNameRe.test(name)){
	  errorString += "<li>Please enter your full name.</li>";
  	}
	if(!(password === "")){
	if(!passwordRe.test(password)){
	  errorString += "<li>Password needs to contain minimum nine characters, at least one uppercase letter, one lowercase letter, one number and one special character.</li>";
  	}
	}
	if(!emailRe.test(email)){
	  errorString = "<li>Please enter a valid email address.</li>";
  }
	if(errorString === ""){
		if(name !== currentName){
			newData["name"] = name;
		}
		if(password){
			newData["password"] = password;
		}
		if(email !== currentEmail){
			newData["email"] = email;
		}
		//console.log(newData);
		postAccountUpdate(newData);
	}
	else{
		$("#errorList").html(errorString);
	}
	
});
