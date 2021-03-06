
// see https://developer.mozilla.org/en/Persona/Implementing_a_Persona_IdP
// and https://lukasa.co.uk/2013/04/Writing_A_Persona_Identity_Provider/


/* This function sends a POST request from the client to
 * https://your.persona.server/cert_key, where some program (like Mozilla's
 * example restful node-based broswerid-certifier server [0]) is listening
 * and is able to sign and send back the certificate.
 *
 * [0]: https://github.com/mozilla/browserid-certifier
 */
function signServerSideRestful(email, publicKey, certDuration, callback) {
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
		message: "Unexpected status code: " + request.status
	    };
	}
    }
    request.open("POST", '/cert_key', true);
    request.setRequestHeader("Content-type", "application/json");
    request.setRequestHeader("Content-length", body.length);
    request.setRequestHeader("Connection", "close");
    request.send(body);
};

/* DON'T EVER USE THIS FUNCTION ON A PRODUCTION MACHINE.
 *
 * This function signs a certificate, client-side, using the server's private
 * key, which is public in this case because it's a testing server. YOU SHOULD
 * NEVER PUBLISH YOUR PRIVATE KEYS, EVER.
 */
function signClientSide(email, publicKey, certDuration, callback) {
  var jwcrypto = require('jwcrypto');

  var publicKey = jwcrypto.loadPublicKey(window.location.host, '/var/key.publickey');
  var secretKey = jwcrypto.loadSecretKey(window.location.host, '/var/key.secretkey');
  var expiration = new Date();
  var iat = new Date();

  expiration.setTime(expiration.valueOf() + (86400000 * 1000));
  // Set issuedAt to 10 seconds ago to pad for verifier clock skew.
  iat.setTime(iat.valueOf() - (10 * 1000));

  // NOTE: DO NOT EVER USE A STATIC SEED FOR A RANDOM NUMBER GENERATOR
  // Seed the RNG for browsers without window.crypto.getRandomValues
  // https://developer.mozilla.org/en-US/docs/DOM/window.crypto.getRandomValues
  jwcrypto.addEntropy("High-security random data.");
  jwcrypto.cert.sign(
    {publicKey: publicKey, principal: {email: email}},
    {issuer: window.location.host, issuedAt: iat.valueOf(), expiresAt: expiration},
    {},
    secretKey,
    callback(signedObject)
  );
};

navigator.mozId.beginProvisioning(function(email, certDuration) {
    //if (!email) {
    //    navigator.mozId.raiseProvisioningFailure(
    //        "User is not authenticated as target user");
    //} else {

    // we just always pretend they are authenticated
    navigator.mozId.genKeyPair(function(publicKey) {
	try {
	    signClientSide(email, publicKey, certDuration, function(certificate) {
		//navigator.mozId.requestCertificate(certificate);
		navigator.mozId.registerCertificate(certificate);
	    });
	} catch (e) {
	    navigator.mozId.raiseProvisioningFailure("Unexpected error occurred");
	}
    });
    //}
});

