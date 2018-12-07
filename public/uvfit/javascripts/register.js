function sendReqForSignup() {
  var email = document.getElementById("email").value;
  var fullName = document.getElementById("fullName").value;
  var password = document.getElementById("password").value;
  var passwordConfirm = document.getElementById("passwordConfirm").value;
	
  var isValid = true;
    
  var passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;
  var fullNameRe = /\w+/;
  var emailRe = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  var passwordReLength = /\b[a-zA-Z0-9]{10,20}\b/;
  var passwordReLowerCase = /[a-z]/;
  var passwordReUpperCase = /[A-Z]/;
  var passwordReDigit = /[0-9]/;
  var responseDiv = document.getElementById('ServerResponse');

  responseDiv.innerHTML = "<ul>";
  
  // Check for valid email address
  if(!emailRe.test(email)){
	  responseDiv.style.display = "block";
	  responseDiv.innerHTML = "<li>Please enter a valid email address.</li>";
	  return;
  }
  
  // Check that a full name was entered
  if(!fullNameRe.test(fullName)){
	  responseDiv.style.display = "block";
	  responseDiv.innerHTML = "<li>Please enter your full name.</li>";
	  return;
  }
  
  // Check that the passwords match
  if (password != passwordConfirm) {
      responseDiv.style.display = "block";
      responseDiv.innerHTML += "<li>Password does not match.</li>";
      return;
  }
  
  //Check password requirements
  if(!passwordRe.test(password)){
	  responseDiv.style.display = "block";
	  responseDiv.innerHTML = "<li>Password needs to contain minimum nine characters, at least one uppercase letter, one lowercase letter, one number and one special character.</li>";
	  return;
  }
	
  responseDiv.innerHTML = "</ul>";

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", signUpResponse);
  xhr.responseType = "json";
  xhr.open("POST", '/users/register');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({email:email,fullName:fullName, password:password}));
}

function signUpResponse() {
  var responseDiv = document.getElementById('ServerResponse');

  // 200 is the response code for a successful GET request
  if (this.status === 201) {
    if (this.response.success) {
      // Change current location to the signin page.
      window.location = "signin.html";
    } 
    else {
    	console.log("here ..");
      responseHTML += "<ol class='ServerResponse'>";
      for (key in this.response) {
        responseHTML += "<li> " + key + ": " + this.response[key] + "</li>";
      }
      responseHTML += "</ol>";
    }
  }
  else if(this.status === 400){
    // Use a span with dark red text for errors
    responseHTML = "<span class='red-text text-darken-2'>";
    responseHTML += "Error: " + this.response.message;
    responseHTML += "</span>";
  }
  // Update the response div in the webpage and make it visible
  responseDiv.style.display = "block";
  responseDiv.innerHTML = responseHTML;
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("signup").addEventListener("click", sendReqForSignup);
});
