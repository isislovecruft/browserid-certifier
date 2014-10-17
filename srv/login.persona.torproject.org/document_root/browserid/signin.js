
function toggleVisibility(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'block') {
        e.style.display = 'none';
    } else {
        e.style.display = 'block';
    }
};

function userHasActiveSession(email) {
    if (email) {
        return true;
    };
    return false;
};

function authenticateEmailCancel() {
    console.log('User clicked cancel.');
};

function authenticateEmail() {
    console.log("Attempting to authenticate email address...");
    try {
        var email = document.getElementById('emailInput').value;
        var passwd = document.getElementById('passwordInput').value;

        console.log("Got email address: " + email);
        console.log("Got password: " + passwd);

        navigator.mozId.beginAuthentication(function(email) {
            console.log("Starting beginAuthentication() callback...");
            if (userHasActiveSession(email)) {
                console.log("Client has email! Redirecting to Persona.");
                navigator.mozId.completeAuthentication(
                  function() {
                    var sm = "Login successful!";
                    var oldText = document.getElementById('loginSuccessText').innerHTML
                    document.getElementById('loginSuccessText').innerHTML = sm + oldText;
                    toggleVisibility('loginSuccess');
                  });
            } else {
                throw "Please enter a valid email address and try again.";
            };
        });
        console.log("Finished beginAuthentication() callback.");

    } catch (e) {
        console.log(e + ": " + e.stack);
        // Make sure we don't overwrite the button
        var oldText = document.getElementById('alertWarnText').innerHTML;
        document.getElementById('alertWarnText').innerHTML = e + oldText;
        toggleVisibility('alertWarn');
    };

};

function checkForNativePersonaAPI() {
    var hasAPI = false;
    var explain = [
        "To use this Persona testing server, you must first navigate to",
        "about:config and set `dom.identity.enabled` to `true`.",
    ].join(" ");

    try {
        if (navigator.mozId != null) {
            hasAPI = true;
        }
    } catch (e) {
        if (e instanceof TypeError) {
            hasAPI = false;
        };
    };

    if (hasAPI === false) {
        console.log("WARNING: Native Persona API is missing; no navigator.mozId. "
                    + explain);
        // Make sure we don't overwrite the button
        var oldText = document.getElementById('alertWarnText').innerHTML;
        document.getElementById('alertWarnText').innerHTML = explain + oldText;
        toggleVisibility('alertWarn');
        return false;
    } else {
        console.log("Hooray! We have navigator.mozId!");
        return true;
    };

    return false;
};
