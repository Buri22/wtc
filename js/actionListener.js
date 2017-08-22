/**
 * Created by Uživatel on 19.8.2017.
 * EventListener loads action listeners for particular page
 */
// TODO: Rename to ActionProvider + refactor all functions in master.js
var ActionListener = {

    // Register
    register: function() {
        // TODO: Show password strength
        var data = {
            user_name: $('#userName').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            password_confirm: $('#passwordConfirm').val()
        };

        Helper.ajaxCall('register', 'POST', 'wtc_ajax.php', data, function (response) {
            if (response == 1) {  // new user was created successfully
                $('#content').load('templates/login.html', function() {
                    Helper.setTextById('login_msg', 'You were successfully registered, please login with your credentials.');
                });
            }
            else if (response == 2) {
                Helper.setTextById("register_msg", "Please, enter all information.");
            }
            else if (response == 3) {
                Helper.setTextById("register_msg", "Email format is not valid.");
            }
            else if (response == 4) {
                Helper.setTextById("register_msg", "Passwords don`t match, please, enter them again.");
            }
            else if (response == 5) {
                Helper.setTextById("register_msg", "You are already registered. Please login with this email.");
            }
            else {
                Helper.setTextById("register_msg", "New user failed to create!");
            }
        });

    },

    // Login
    login: function() {
        var data = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        Helper.ajaxCall('login', 'POST', 'wtc_ajax.php', data, function (response) {
            if (response.Id && response.UserName && response.Email) {
                docCookies.setItem('wtc_login', response.Id);   // Create cookie wtc_login
                $('#content').load('templates/main.html');
                getTaskList(docCookies.getItem('wtc_login'));
            }
            else if (response == 2) {
                Helper.setTextById("login_msg", "Please, enter all information.");
            }
            else if (response == 3) {
                Helper.setTextById("login_msg", "Email format is not valid.");
            }
            else if (response == 4) {
                Helper.setTextById("login_msg", "You are not registered yet.");
            }
            else if (response == 5) {
                Helper.setTextById("login_msg", "Wrong password, please try it again");
            }
            else {
                Helper.setTextById('login_msg', 'Login failed, please try again later.');
            }
        });
    }
};