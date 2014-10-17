
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
            if (userHasActiveSession(email)) {
                navigator.mozId.completeAuthentication();
            } else {
                var err = "Please enter a valid email address and try again.";
                // Make sure we don't overwrite the button
                var oldText = document.getElementById('alertWarnText').innerHTML;
                document.getElementById('alertWarnText').innerHTML = err + oldText;
                toggleVisibility('alertWarn');
            };
        });
        console.log("Finished beginAuthentication() callback.");

    } catch (e) {
        console.log(e + ": " + e.stack);
    };

    var sm = "Login successful!";
    console.log(sm);
    document.getElementById('loginSuccessText').innerHTML = sm;
    toggleVisibility('loginSuccess');
};

function checkForNativePersonaAPI() {
    try {
        navigator.mozId.raiseAuthenticationFailure();
    } catch (e) {
        var explain = [
            "To use this Persona testing server, you must first navigate to",
            "about:config and set `dom.identity.enabled` to `true`.",
        ].join(" ");
        console.log("WARNING: Native Persona API is missing; no navigator.mozId. "
                    + explain);
        document.getElementById('alertWarnText').innerHTML = explain;
        toggleVisibility('alertWarn');
        return false;
    };
    console.log("Hooray! We have navigator.mozId!");
    return true;
};
