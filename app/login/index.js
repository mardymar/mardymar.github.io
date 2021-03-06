//Log out on load
if ( Parse.User.current() ) {
    Parse.User.logOut();
    // check if really logged out
    if (Parse.User.current())
        alert("Failed to log out!");
}

//Called when the sign in button is clicked
function login(){
    event.preventDefault();
    submitToParse(document.getElementById('username').value, document.getElementById('password').value);
}

//Login using Parse
function submitToParse(username, password) {
    Parse.User.logIn(username.toLowerCase(), password, {
        success: function (user) {
            Parse.User.logIn();
            location.href='app/welcome/welcome.html';
        },
        error: function (user, error) {
            alert(error.message);
        }
    });
}