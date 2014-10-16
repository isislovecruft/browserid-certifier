

// see https://developer.mozilla.org/en/Persona/Implementing_a_Persona_IdP
// and https://lukasa.co.uk/2013/04/Writing_A_Persona_Identity_Provider/

function signServerSide(email, publicKey, certDuration, callback) {
    // Artificially skew times into the past.
    // Fixes issues with client clocks being slightly off.
    var now = new Date();
    now.setSeconds(now.getSeconds() - 120);
    var expiration = now.valueOf() + (certDuration * 1000);

    var body = JSON.stringify({
	duration: expiration,
	pubkey: publicKey,
	email: email,
    });

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
	if(request.readyState === 4 && request.status === 200) {
	    console.log("OK: got /cert_key response: " + request.responseText);
	    callback(request.responseText);
	} else {
	    console.log("ERROR: code " + request.status +
			" while talking to browserid-certifier/cert_key!");
	    throw {
		name: "InvalidRequestError",
		message: "Unexpected status code: " + requesst.status
	    };
	}
    }
    request.open("POST", '/cert_key', true);
    request.setRequestHeader("Content-type", "application/json");
    request.setRequestHeader("Content-length", body.length);
    request.setRequestHeader("Connection", "close");
    request.send(body);
};


navigator.mozId.beginProvisioning(function(email, certDuration) {
    //if (!email) {
    //    navigator.mozId.raiseProvisioningFailure(
    //        "User is not authenticated as target user");
    //} else {

    // we just always pretend they are authenticated
    navigator.mozId.genKeyPair(function(publicKey) {
	try {
	    signServerSide(email, publicKey, certDuration, function(certificate) {
		//navigator.mozId.requestCertificate(certificate);
		navigator.mozId.registerCertificate(certificate);
	    });
	} catch (e) {
	    navigator.mozId.raiseProvisioningFailure("Unexpected error occurred");
	}
    });
    //}
});

