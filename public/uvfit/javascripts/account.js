// Get the modal
var modal = document.getElementById("myModal");
// Get the button that opens the modal
var btn = document.getElementById("UVInfoButton");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
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

$(function() { 
	$("#UVThreshold").on("input change", function () {
		$("#updateThreshold").css("display", "block");
	});
	$("#updateThreshold").click(function() { 
		$.ajax({
			url: '/devices/uvedit',
			type: 'POST',
			headers: { 'x-auth': window.localStorage.getItem("authToken") },
			data: { deviceId: 31002b000747363339343638, 
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



