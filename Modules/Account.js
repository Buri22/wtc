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
            email: userData.Email,
			appSettings: JSON.parse(userData.AppSettings)
        };
    }
    // Obsolete function, it is exposed to public but never used
    // TODO: refactor
    function getUserName() {
        return user.userName || 'User name is missing.';
    }
    function getUserId() {
        return user.id || false;
    }
	function getUserAppSettings() {
		return user.appSettings;
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
        // TO make sure that templates are defined
        if (typeof $accountMenuItem == 'undefined') {
            mediator.subscribe('AccountTemplatesReady', _renderMenuItem, $container);
        }
        else {
            $menuItemContainer = typeof $menuItemContainer == 'undefined' ? $($container) : $menuItemContainer;
            // Bind onclick events for menuItems
            _bindMenuItemsEvents();

            $accountMenuItem.find('#user_name').empty().append(' ' + user.userName);
            $menuItemContainer.parent()
                .append($accountMenuItems)
                .append($modal);
        }
    }
    function _renderModal() {
        $.get('view/modal_parts.htm', function(templates) {
			var $templates = $(templates);
            var checked, selected = '';
            var sectionDisplay = 'none';
            if (user.appSettings.sideMenu.active == true || user.appSettings.sideMenu.active == 'true') {
                checked = 'checked';
                sectionDisplay = 'block';
            }
            var appOptions = app.getAppOptions();
            var themeColorOptions = [], sideMenuPositions = [];
            // Set Theme colors and set selected one
            for (var i = 0; i < appOptions.themeColors.length; i++) {
                if (appOptions.themeColors[i] == user.appSettings.theme.color) selected = 'selected';
                themeColorOptions.push({color: appOptions.themeColors[i], selected: selected});
                selected = '';
            }
            // Set SideMenu positions and set selected one
            for (i = 0; i < appOptions.sideMenuPositions.length; i++) {
                if (appOptions.sideMenuPositions[i] == user.appSettings.sideMenu.position) selected = 'selected';
                sideMenuPositions.push({position: appOptions.sideMenuPositions[i], selected: selected});
                selected = '';
            }
            var account_app_body = Mustache.render($templates.filter('#modal_body_account_app').html(), {
                userName: user.userName,
                email: user.email,
                appSettings: {
                    themeColorOptions: themeColorOptions,
                    checked: checked,
                    sectionDisplay: sectionDisplay,
                    sideMenuPositions: sideMenuPositions
                }
            });
            var $submitBtn = $templates.find('.submit_btn').text('Edit').prop('disabled', true);
            var data = {
                modal_id: 'user_account',
                title: 'Account settings',
                modal_body: account_app_body,
                submit_btn: $submitBtn.addClass('account_btn').parent().html()
							+ $submitBtn.hide().removeClass('account_btn').addClass('app_btn').parent().html()
            };

            Helper.getModalTemplate($modal, data);
        });
    }

    function _bindLoginEvents() {
        $loginBtn.on('click', login);
        $registrationLink.on('click', renderRegister);
        Helper.bindKeyShortcutEvent($loginPage, '#login');
    }
    function _bindRegitrationEvents() {
        $registerBtn.on('click', register);
        $loginLink.on('click', renderLogin);
        Helper.bindKeyShortcutEvent($regPage, '#register');
    }
    function _bindMenuItemsEvents() {
        $logoutMenuItem.off('click').on('click', _logOut);
        $accountMenuItem.off('click').on('click', _renderModal);
    }
    function _bindModalEvents($container) {
        // Check to handle just account modal
        if ($container.find('.modal-dialog').attr('id') == 'user_account') {
            // Submit btn actions
            $container.find('.submit_btn.account_btn').off('click').on('click', _editAccount);
            $container.find('.submit_btn.app_btn').off('click').on('click', _editAppSettings);

			// Edit/Delete tab click event
			$container.find('#account_page').off('click').on('click', function() {
				$container.find('#account_page').addClass('active');
				$container.find('#app_page').removeClass('active');
				$container.find('.modal-header .modal-title').text('Account settings');
				$container.find('#account_settings_body, .submit_btn.account_btn').show();
				$container.find('#app_settings_body, .submit_btn.app_btn').hide();
				$container.find('#edit_account_result_msg').empty();

				Helper.bindKeyShortcutEvent($container, '.submit_btn.account_btn');
                Helper.checkFormToDisableSubmitBtn($container.find('input, select'), $container.find('.submit_btn.account_btn'));
			});
			$container.find('#app_page').off('click').on('click', function() {
				$container.find('#account_page').removeClass('active');
				$container.find('#app_page').addClass('active');
				$container.find('.modal-header .modal-title').text('App settings');
				$container.find('#account_settings_body, .submit_btn.account_btn').hide();
				$container.find('#app_settings_body, .submit_btn.app_btn').show();
				$container.find('#edit_account_result_msg').empty();

				Helper.bindKeyShortcutEvent($container, '.submit_btn.app_btn');
                Helper.checkFormToDisableSubmitBtn($container.find('input, select'), $container.find('.submit_btn.app_btn'));
			});
			
            // Handle submit button according to changed form data
            Helper.checkFormToDisableSubmitBtn($container.find('input, select'), $container.find('.submit_btn.account_btn'));
        }
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
	function _editAppSettings() {
        var themeColor = $modal.find('#themeColor').val();
        var sideMenuActive = $modal.find('#sideMenuActive').is(':checked');
		var data = {
			app_settings: {
				theme: { color: themeColor },
				sideMenu: { active: sideMenuActive }
			}
		};
		if (sideMenuActive) {
			data.app_settings.sideMenu.position = $modal.find('#sideMenuPosition').val();
		}
		
        Helper.ajaxCall('editAppSettings', 'POST', data, function(response) {
            var $resultMsg = $modal.find('#edit_account_result_msg');
            if (response == 1) {
                // Update Account Model
                user.appSettings = {
                    theme: { color: themeColor },
                    sideMenu: {
                        active: sideMenuActive,
                        position: data.app_settings.sideMenu.position
                    }
                };

                mediator.publish('ReloadPageLayout', user.appSettings);
                mediator.publish('SetResultMessage', 'Your app settings were successfully edited.');
                $modal.modal('hide');
            }
            else if (response == 2) {
                $resultMsg.text('Some required form data are missing.');
            }
            else if (response == 3) {
                $modal.modal('hide');
                _logOut('You were unexpectedly logged out.');
            }
        });
	}

    // Subscribe to listen for calls from outside
    mediator.subscribe('RenderLogin', renderLogin);
    mediator.subscribe('LogOut', _logOut);
    mediator.subscribe('MenuReadyToImportModuleItems', _renderMenuItem);
    mediator.subscribe('ReadyToBindModalEvents', _bindModalEvents);

    return {
        setUser: setUser,
        getUserId: getUserId,
        getUserName: getUserName,
        getUserAppSettings: getUserAppSettings,
        renderLogin: renderLogin
    }
};