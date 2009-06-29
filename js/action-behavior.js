// If JavaScript's supported...

var Build = {}; // Create a container

Build.secondCounter = 0; // Init counter
Build.tzOffset = (new Date()).getTimezoneOffset() * 60000; // Set a timezone offset
Build.value = "";

Build.computeLocalTime = function(time) {
	var localTime = new Date(time).getTime() - Build.tzOffset;
	return new Date(localTime);
}

Build.getDeltaFromToday = function(date) {
	var now = (new Date()).getTime(); // Local time
	var buildChange = new Date(date).getTime() - Build.tzOffset; // Server time to adapt to local timezone
	return parseInt( (now - buildChange) / 1000 ); // Convert milliseconds to seconds
}

Build.convertSecondsToDayHHMMSS = function(seconds) {

	var days = Math.floor(seconds / 86400); // 1 day = 60 * 60 * 24 seconds
	var hours = Math.floor(seconds %  86400 / 3600);
	var minutes = Math.floor(seconds % 3600 / 60); // 1 hour = 3600 seconds
	var seconds = seconds % 60;

	Build.value = "";
	Build.format(days, "day");
	Build.format(hours, "hour");
	Build.format(minutes, "minute");
	Build.format(seconds, "second");
	return Build.value;
}

Build.format = function(value, word) {
	if (value > 0) {
		if (Build.value.length > 0)
			Build.value += ", ";
		Build.value += value + " " + word;
		if (value > 1)
			Build.value += "s";
	}
}

google.load("prototype", "1.6");
google.setOnLoadCallback(function() {

	// Get values from HTML "value tags"
	Build.changeDate = $('changeDate').innerHTML;
	Build.updateDate = $('updateDate').innerHTML;
	Build.appName    = $('appName').innerHTML;

	// 1. Fix time according current browser time zone
	$('changeDate').update(Build.computeLocalTime( Build.changeDate ));
	$('updateDate').update(Build.computeLocalTime( Build.updateDate ));

	// 2. Use more often Ajax refresh instead of HTTP ones
	new PeriodicalExecuter(function() {
		new Ajax.Request('/state?app_name=' + Build.appName, { 
			method: 'get', 
			onSuccess: function(xhr) {
				var valueObject = xhr.responseJSON;

				$('updateDate').update(Build.computeLocalTime(valueObject.currentTime));

				if (valueObject.passed != Build.passed)
					document.location.href = '/?app_name=' + Build.appName; // If changed, reload page
			}
		})
	}, 15);

	// Set number of secound since last build change
	Build.secondCounter = Build.getDeltaFromToday(Build.changeDate);

	// 3. Set a second counter since last build change
	new PeriodicalExecuter(function() {
		Build.secondCounter++;
		$('counter').update( "for " + Build.convertSecondsToDayHHMMSS(Build.secondCounter) );
	}, 1);

	// 4. Load Google Analytics
	try {
		var pageTracker = _gat._getTracker("UA-8913337-1");
		pageTracker._trackPageview();
	} catch(err) {}

});
