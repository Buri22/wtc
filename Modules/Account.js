/**
 * Created by U�ivatel on 18.9.2017.
 */
var Account = function() {
    var user = {};
    var $content = $('#content');
    var $account, $loginPage, $loginMsg, $loginEmail, $loginPassword, $loginBtn, $registrationLink,
        $regPage, $regMsg, $userName, $regEmail, $regPassword, $regPasswordConfirm, $registerBtn, $loginLink,
        $accountMenuItems, $accountMenuItem, $logoutMenuItem, $menuItemContainer, $modal;

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
    function _renderMenuItem($container) {
        $menuItemContainer = typeof $menuItemContainer == 'undefined' ? $container : $menuItemContainer;
        // Bind onclick events for menuItems
        $logoutMenuItem.on('click', _logOut);
        $accountMenuItem.on('click', _renderModal);

        // TODO: Make sure that templates are defined
        $accountMenuItem.find('#user_name').empty().append(' ' + user.userName);
        $menuItemContainer.parent()
            .append($accountMenuItems)
            .append($modal);
    }
    function _renderModal() {
        $.get('view/modal_parts.htm', function(templates) {
            var account_body = Mustache.render($(templates).filter('#modal_body_account').html(), {
                userName: user.userName,
                email: user.email
            });
            var data = {
                modal_id: 'user_account',
                title: 'Account settings',
                modal_body: account_body,
                submit_btn_text: 'Edit'
            };

            Helper.getModalTemplate($modal, data, _editAccount);
        });
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
                mediator.publish('UserLogin');
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
    function _logOut(msg) {
        msg = typeof msg == 'string' ? msg : 'You have been successfully logged out.';
        Helper.ajaxCall('logout', 'POST', undefined, function(response) {
            if (response) {
                renderLogin(msg);
            }
        });
        $loginEmail.val('');
        $loginPassword.val('');
        mediator.publish('UserLogout');
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

    function _editAccount() {
        var userName = $modal.find('#userName').val().trim();
        var email = $modal.find('#email').val().trim();
        var changePassword = $modal.find('#change_password').is(':checked');

        var data = {
            user_name: userName,
            email: email,
            change_password: changePassword
        };
        if (changePassword) {
            data['password_old']     = $modal.find('#password_old').val().trim();
            data['password_new']     = $modal.find('#password_new').val().trim();
            data['password_confirm'] = $modal.find('#password_confirm').val().trim();
        }

        Helper.ajaxCall('editAccount', 'POST', data, function(response) {
            var $resultMsg = $modal.find('#edit_account_result_msg');
            if (response == 1) {
                // Update Account Model
                user.userName = userName;
                user.email = email;

                _renderMenuItem();
                mediator.publish('SetResultMessage', 'Your account info was successfully edited.');
                $modal.modal('hide');
            }
            else if (response == 2) {
                $resultMsg.text('Some required form data are missing.');
            }
            else if (response == 3) {
                $modal.modal('hide');
                _logOut('You were unexpectedly logged out.');
            }
            else if (response == 4) {
                $resultMsg.text('Email has a wrong format (example@host.com).');
            }
            else if (response == 5) {
                $resultMsg.text('You can not use this email, please try something else.');
            }
            else if (response == 6) {
                $resultMsg.text('Current password is wrong.');
            }
            else if (response == 7) {
                $resultMsg.text('New passwords do not equal.');
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