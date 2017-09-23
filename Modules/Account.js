/**
 * Created by Uživatel on 18.9.2017.
 */
var Account = function() {
    var user = {};
    var $content = $('#content');
    var $account, $loginPage, $loginMsg, $loginEmail, $loginPassword, $loginBtn, $registrationLink,
        $regPage, $regMsg, $userName, $regEmail, $regPassword, $regPasswordConfirm, $registerBtn, $loginLink,
        $accountMenuItems, $accountMenuItem, $logoutMenuItem, $modal;

    // Load Views & Cache DOM
    $.get('view/account.html', function(template) {
        $account            = $(template);

        $loginPage          = $account.filter('#login_page_content');
        $loginMsg           = $loginPage.find('#login_msg');
        $loginEmail         = $loginPage.find('#emailLogin');
        $loginPassword      = $loginPage.find('#passwordLogin');
        $loginBtn           = $loginPage.find('#login');
        $registrationLink   = $loginPage.find('#registration_page');

        $regPage            = $account.filter('#registration_page_content');
        $regMsg             = $regPage.find('#register_msg');
        $userName           = $regPage.find('#userName');
        $regEmail           = $regPage.find('#emailReg');
        $regPassword        = $regPage.find('#passwordReg');
        $regPasswordConfirm = $regPage.find('#passwordConfirm');
        $registerBtn        = $regPage.find('#register');
        $loginLink          = $regPage.find('#login_page');

        $accountMenuItems   = $account.filter('#account_menu');
        $accountMenuItem    = $accountMenuItems.find('#account');
        $logoutMenuItem     = $accountMenuItems.find('#logout');
        $modal              = $account.filter('#account_modal');

        mediator.publish('AccountTemplatesReady');
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
            mediator.subscribe('AccountTemplatesReady', renderLogin);
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
    function _renderMenuItem() {
        // TODO: Make sure that templates are defined
        $accountMenuItem.find('#user_name').empty().append(' ' + user.userName);
        $('#main_menu').parent()
            .append($accountMenuItems)
            .append($modal);
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
                setUser(response);
                mediator.publish('RenderAppLayout');
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
    mediator.subscribe('MenuReadyToImportModuleItems', _renderMenuItem);

    return {
        setUser: setUser,
        getUserName: getUserName,
        renderLogin: renderLogin
    }
};