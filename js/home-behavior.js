// If JavaScript's supported...

google.load("prototype", "1.6");
google.setOnLoadCallback(function() {

	// Load Google Analytics
	try {
		var pageTracker = _gat._getTracker("UA-8913337-1");
		pageTracker._trackPageview();
	} catch(err) {}

});


