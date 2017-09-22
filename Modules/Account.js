/**
 * Created by Uživatel on 18.9.2017.
 */
var Account = function() {
    var user = {};
    var $content = $('#content');
    var $loginPage, $loginMsg, $loginEmail, $loginPassword, $loginBtn, $registrationLink,
        $regPage, $regMsg, $userName, $regEmail, $regPassword, $regPasswordConfirm, $registerBtn, $loginLink;

    // Load Views & Cache DOM
    $.get('view/login.html', function(template) {
        $loginPage        = $(template);
        $loginMsg         = $loginPage.find('#login_msg');
        $loginEmail       = $loginPage.find('#email');
        $loginPassword    = $loginPage.find('#password');
        $loginBtn         = $loginPage.find('#login');
        $registrationLink = $loginPage.find('#register_page');

        mediator.publish('LoginTemplateReady');
    });
    $.get('view/register.html', function(template) {
        $regPage            = $(template);
        $regMsg             = $regPage.find('#register_msg');
        $userName           = $regPage.find('#userName');
        $regEmail           = $regPage.find('#email');
        $regPassword        = $regPage.find('#password');
        $regPasswordConfirm = $regPage.find('#passwordConfirm');
        $registerBtn        = $regPage.find('#register');
        $loginLink          = $regPage.find('#login_page');
    });

    function setUser(userData) {
        user = {
            id: userData.Id,
            userName: userData.UserName,
            email: userData.Email
        };
    }
    function getUserName() {
        return user.userName || 'User name is missing.';
    }

    function renderLogin(msg) {
        if (typeof $loginPage == 'undefined') {
            mediator.subscribe('LoginTemplateReady', renderLogin);
        }
        else {
            msg = typeof msg != 'string' ? '' : msg || '';
            $content.html($loginPage);
            $loginMsg.text(msg);
            _bindLoginEvents();
        }
    }
    function renderRegister(msg) {
        msg = typeof msg != 'string' ? '' : msg || '';
        $content.html($regPage);
        $regMsg.text(msg);
        _bindRegitrationEvents();
    }

    function _bindLoginEvents() {
        $loginBtn.on('click', login);
        $registrationLink.on('click', renderRegister);
        Helper.bindEnterSubmitEvent($loginPage, '#login');
    }
    function _bindRegitrationEvents() {
        $registerBtn.on('click', register);
        $loginLink.on('click', renderLogin);
        Helper.bindEnterSubmitEvent($regPage, '#register');
    }

    function login() {
        var data = {
            email: $loginEmail.val(),
            password: $loginPassword.val()
        };

        Helper.ajaxCall('login', 'POST', data, function (response) {
            if (response.Id && response.UserName) {
                ActionProvider.renderLayout(response);
            }
            else if (response == 2) {
                $loginMsg.text('Please, enter all information.');
            }
            else if (response == 3) {
                $loginMsg.text('Email format is not valid.');
            }
            else if (response == 4) {
                $loginMsg.text('You are not registered yet.');
            }
            else if (response == 5) {
                $loginMsg.text('Your account is blocked.');
            }
            else if (response == 6) {
                $loginMsg.text('Wrong password, please try it again.');
            }
            else {
                $loginMsg.text('Login failed, please try again later.');
            }
        });
    }
    function _logOut() {
        Helper.ajaxCall('logout', 'POST', undefined, function(response) {
            if (response) {
                renderLogin('You have been successfully logged out.');
            }
        });
    }
    function register() {
        // TODO: Show password strength
        var data = {
            user_name: $userName.val(),
            email: $regEmail.val(),
            password: $regPassword.val(),
            password_confirm: $regPasswordConfirm.val()
        };

        Helper.ajaxCall('register', 'POST', data, function (response) {
            if (response == 1) {  // new user was created successfully
                renderLogin('You were successfully registered, please login with your credentials.');
            }
            else if (response == 2) {
                $regMsg('Please, enter all information.');
            }
            else if (response == 3) {
                $regMsg('Email format is not valid.');
            }
            else if (response == 4) {
                $regMsg('Passwords don`t match, please, enter them again.');
            }
            else if (response == 5) {
                $regMsg('You are already registered. Please login with this email.');
            }
            else {
                $regMsg('New user failed to create!');
            }
        });

    }

    // Subscribe to listen for calls from outside
    mediator.subscribe('RenderLogin', renderLogin);
    mediator.subscribe('LogOut', _logOut);

    return {
        setUser: setUser,
        getUserName: getUserName,
        renderLogin: renderLogin
    }
};