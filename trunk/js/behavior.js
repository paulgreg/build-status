// If JavaScript's supported...

var Build = {}; // Create a container

Build.tzOffset = (new Date()).getTimezoneOffset() * 60000; // Set a timezone offset

Build.computeLocalTime = function(time) {
	var localDate = new Date(time).getTime() - Build.tzOffset;
	return new Date(localDate);
}

google.load("prototype", "1.6");
google.setOnLoadCallback(function() {

	// Get values from HTML "value tags"
	Build.changeDate = $('changeDate').innerHTML;
	Build.updateDate = $('updateDate').innerHTML;
	Build.appName    = $('appName').innerHTML;

	// First, fix time according current browser time zone
	$('changeDate').update(Build.computeLocalTime( Build.changeDate ));
	$('updateDate').update(Build.computeLocalTime( Build.updateDate ));

	// Then, use more often Ajax refresh instead of HTTP ones
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
});
