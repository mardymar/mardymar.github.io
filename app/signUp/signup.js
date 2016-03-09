function submitSignUp(){

    createUserToParse(document.getElementById('username').value.toLowerCase(),
        document.getElementById('password').value.toLowerCase(),
        document.getElementById('email').value.toLowerCase());
}

function createUserToParse(username, password, email){
    var user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    user.set("email", email);

    user.signUp(null, {
        success: function (user) {
            // Hooray! Let them use the app now.
            location.href='../newSet/newSet.html';
        },
        error: function (user, error) {
            // Show the error message somewhere and let the user try again.
            alert("Error: " + error.code + " " + error.message);
        }
    });


}