function sendReqForActivityInfo(deviceId) {
   $.ajax({
      url: '/activity/summary/' + deviceId,
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: activitySumSuccess,
      error: activitySumError
   });
}

function activitySumSuccess(data, textStatus, jqXHR){
	var durationStringWalk = 0.0;
	var caloriesBurnedWalk = 0.0;
	var UVWalk = 0.0;
	var averageUVWalk = 0.0;
	var durationStringRun = 0.0;
	var caloriesBurnedRun = 0.0;
	var UVRun = 0.0;
	var averageUVRun = 0.0;
	var durationStringBike = 0.0;
	var caloriesBurnedBike = 0.0;
	var UVBike = 0.0;
	var averageUVBike = 0.0;
	var iWalk = 0;
	var iRun = 0;
	var iBike = 0;
	
	for (var activity of data.activity) {
		if(activity.activityId === -1){
			
		}
		else{
			if(activity.activityType === "Walking"){
				durationStringWalk += parseFloat(activityDuration(activity.duration));
				caloriesBurnedWalk += activity.calories;
				UVWalk += activity.uv;
				iWalk += 1;
				averageUVWalk = UVWalk/iWalk;
			}
			else if(activity.activityType === "Running"){
				durationStringRun += parseFloat(activityDuration(activity.duration));
				caloriesBurnedRun += activity.calories;
				UVRun += activity.uv;
				iRun += 1;
				averageUVRun = UVRun/iRun;	
			}
			else if(activity.activityType === "Biking"){
				durationStringBike += parseFloat(activityDuration(activity.duration));
				caloriesBurnedBike += activity.calories;
				UVBike += activity.uv;
				iBike += 1;
				averageUVBike = UVBike/iBike;
			}
			
		}
		
	}
	$("#error").hide();
	$("#totalWalkingTime").html(durationStringWalk);
	$("#totalWalkingCalories").html(caloriesBurnedWalk);
	$("#totalWalkingUV").html(averageUVWalk);
	$("#totalRunningTime").html(durationStringRun);
	$("#totalRunningCalories").html(caloriesBurnedRun);
	$("#totalRunningUV").html(averageUVRun);
	$("#totalBikingTime").html(durationStringBike);
	$("#totalBikingCalories").html(caloriesBurnedBike);
	$("#totalBikingUV").html(averageUVBike);
	
}

function activitySumError(jqXHR, textStatus, errorThrown) {
   // If authentication error, delete the authToken 
   // redirect user to sign-in page (which is index.html)
   if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("signin.html");
   } 
   else {
     $("#error").html("Error: " + status.message);
     $("#error").show();
   } 
}

function activityDuration(length){
	var duration = (length/60).toFixed(1);
	return(duration);
}
function updateRadio(){
	var deviceNum = $("input[name='device']:checked").val();
	console.log(deviceNum);
	sendReqForActivityInfo(deviceNum);
}
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("signin.html");
   }
	else{
	var deviceNum = $("#firstDevice").val();
	sendReqForActivityInfo(deviceNum);
	}
   // Register event listeners
	$("#populateMyDevices").change(updateRadio);
});