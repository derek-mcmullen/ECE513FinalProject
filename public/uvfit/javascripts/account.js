function postAccountUpdate(nameNew){
	$.ajax({
        url: '/users/update',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: {name: nameNew}, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
		   	$("#error").hide();
			location.reload(true);
			
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
	console.log(currentName);
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
$('#submitUpdate').click(function(){
	var name = $("#newName").val();
	//console.log(name);
	postAccountUpdate(name);
});
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



