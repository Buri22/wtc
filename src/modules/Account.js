import {mediator} from '../mediator';
import {dataProvider} from '../dataProvider';
import {APP_SETTINGS_OPTIONS, ERROR} from '../constants';

import Mustache from 'mustache';
import Helper from '../helper';
import User from '../model/user';

/**
 * Account module object.
 * Handles Login and Register pages and logged in user account
 */
export default class Account {
    constructor() {
        this.user = null;
        this.$content = $('#content')
        this.$account, this.$loginPage, this.$loginMsg, this.$loginEmail, this.$loginPassword, this.$loginBtn, this.$registrationLink,
        this.$regPage, this.$regMsg, this.$userName, this.$regEmail, this.$regPassword, this.$regPasswordConfirm, this.$registerBtn, this.$loginLink,
        this.$accountMenuItems, this.$accountMenuItem, this.$logoutMenuItem, this.$menuItemContainer, this.$modal;

        // Load Views & Cache DOM
        $.get('view/account.html', (template) => {
            this.$account            = $(template);

            this.$loginPage          = this.$account.filter('#login_page_content');
            this.$loginMsg           = this.$loginPage.find('#login_msg');
            this.$loginEmail         = this.$loginPage.find('#emailLogin');
            this.$loginPassword      = this.$loginPage.find('#passwordLogin');
            this.$loginBtn           = this.$loginPage.find('#login');
            this.$registrationLink   = this.$loginPage.find('#registration_page');

            this.$regPage            = this.$account.filter('#registration_page_content');
            this.$regMsg             = this.$regPage.find('#register_msg');
            this.$userName           = this.$regPage.find('#userName');
            this.$regEmail           = this.$regPage.find('#emailReg');
            this.$regPassword        = this.$regPage.find('#passwordReg');
            this.$regPasswordConfirm = this.$regPage.find('#passwordConfirm');
            this.$registerBtn        = this.$regPage.find('#register');
            this.$loginLink          = this.$regPage.find('#login_page');

            this.$accountMenuItems   = this.$account.filter('#account_menu');
            this.$accountMenuItem    = this.$accountMenuItems.find('#account');
            this.$logoutMenuItem     = this.$accountMenuItems.find('#logout');
            this.$modal              = this.$account.filter('#account_modal');

            mediator.publish('AccountTemplatesReady');
        });
        
        // Subscribe to listen for calls from outside
        mediator.subscribe('RenderLogin', this.renderLogin.bind(this));
        mediator.subscribe('LogOut', this._logOut.bind(this));
        mediator.subscribe('MenuReadyToImportModuleItems', this._renderMenuItem.bind(this));
        mediator.subscribe('ReadyToBindModalEvents', this._bindModalEvents.bind(this));
        dataProvider.register('LoggedUserId', this, this.getUserId);
    }

    setUser(userData) {
        this.user = new User(userData);
    }
    getUserId() {
        //return this.user.id || false;
        return this.user.getId() || false;
    }
	// getUserAppSettings() {
	// 	return this.user.appSettings;
	// }

    renderLogin(msg) {
        if (typeof this.$loginPage == 'undefined') {
            mediator.subscribe('AccountTemplatesReady', this.renderLogin.bind(this));
        }
        else {
            msg = typeof msg != 'string' ? '' : msg || '';
            this.$content.html(this.$loginPage);
            this.$loginMsg.text(msg);
            this._bindLoginEvents();
        }
    }
    renderRegister(msg) {
        msg = typeof msg != 'string' ? '' : msg || '';
        this.$content.html(this.$regPage);
        this.$regMsg.text(msg);
        this._bindRegitrationEvents();
    }
    _renderMenuItem($container) {
        // TO make sure that templates are defined
        if (typeof this.$accountMenuItem == 'undefined') {
            mediator.subscribe('AccountTemplatesReady', this._renderMenuItem.bind(this), $container);
        }
        else {
            // Define menuItemContainer or use already defined one
            this.$menuItemContainer = typeof this.$menuItemContainer == 'undefined' ? $($container) : this.$menuItemContainer;
            // Bind onclick events for menuItems
            this._bindMenuItemsEvents();

            this.$accountMenuItem.find('#user_name').empty().append(' ' + this.user.userName);
            this.$menuItemContainer.parent()
                .append(this.$accountMenuItems)
                .append(this.$modal);
        }
    }
    _renderModal() {
        // TODO: should be loaded in constructor
        $.get('view/modal_parts.htm').done((templates) => {
			let $templates = $(templates),
                //appOptions = app.getAppOptions(),
                themeColorOptions = [], sideMenuPositions = [],
                checked, selected = '',
                sectionDisplay = 'none';
            // if (this.user.appSettings.sideMenu.active) {
            if (this.user.isSideMenuActive()) {
                checked = 'checked';
                sectionDisplay = 'block';
            }
            // Set Theme color options and set selected one
            for (let color of APP_SETTINGS_OPTIONS.themeColors) {
                selected = color == this.user.appSettings.theme.color ? 'selected' : '';
                themeColorOptions.push({
                    color: color, 
                    selected: selected
                });
            }
            // Set SideMenu position options and set selected one
            for (let position of APP_SETTINGS_OPTIONS.sideMenuPositions) {
                selected = position == this.user.appSettings.sideMenu.position ? 'selected' : '';
                sideMenuPositions.push({
                    position: position, 
                    selected: selected
                });
            }
            let accountAppBody = Mustache.render($templates.filter('#modal_body_account_app').html(), {
                userName: this.user.userName,
                email: this.user.email,
                appSettings: {
                    themeColorOptions: themeColorOptions,
                    checked: checked,
                    sectionDisplay: sectionDisplay,
                    sideMenuPositions: sideMenuPositions
                }
            }),
            $submitBtn = $templates.find('.submit_btn').text('Edit').prop('disabled', true),
            data = {
                modal_id: 'user_account',
                title: 'Account settings',
                modal_body: accountAppBody,
                submit_btn: $submitBtn.addClass('account_btn').parent().html()
                            + $submitBtn.hide().removeClass('account_btn').addClass('app_btn').parent().html()
            };

            Helper.getModalTemplate(this.$modal, data);
        });
    }

    _bindLoginEvents() {
        this.$loginBtn.on('click', this.login.bind(this));
        this.$registrationLink.on('click', this.renderRegister.bind(this));
        Helper.bindKeyShortcutEvent(this.$loginPage, '#login');
    }
    _bindRegitrationEvents() {
        this.$registerBtn.on('click', this.register.bind(this));
        this.$loginLink.on('click', this.renderLogin.bind(this));
        Helper.bindKeyShortcutEvent(this.$regPage, '#register');
    }
    _bindMenuItemsEvents() {
        this.$logoutMenuItem.off('click').on('click', this._logOut.bind(this));
        this.$accountMenuItem.off('click').on('click', this._renderModal.bind(this));
    }
    _bindModalEvents($container) {
        // Check to handle just account modal
        if ($container.find('.modal-dialog').attr('id') == 'user_account') {
            // Submit btn actions
            $container.find('.submit_btn.account_btn').off('click').on('click', this._editAccount.bind(this));
            $container.find('.submit_btn.app_btn').off('click').on('click', this._editAppSettings.bind(this));

			// Edit/Delete tab click event
			$container.find('#account_page').off('click').on('click', () => {
				$container.find('#account_page').addClass('active');
				$container.find('#app_page').removeClass('active');
				$container.find('.modal-header .modal-title').text('Account settings');
				$container.find('#account_settings_body, .submit_btn.account_btn').show();
				$container.find('#app_settings_body, .submit_btn.app_btn').hide();
				$container.find('#edit_account_result_msg').empty();

				Helper.bindKeyShortcutEvent($container, '.submit_btn.account_btn');
                Helper.checkFormToDisableSubmitBtn($container.find('#account_settings_body input, #account_settings_body select'), $container.find('.submit_btn.account_btn'));
			});
			$container.find('#app_page').off('click').on('click', () => {
				$container.find('#account_page').removeClass('active');
				$container.find('#app_page').addClass('active');
				$container.find('.modal-header .modal-title').text('App settings');
				$container.find('#account_settings_body, .submit_btn.account_btn').hide();
				$container.find('#app_settings_body, .submit_btn.app_btn').show();
				$container.find('#edit_account_result_msg').empty();

				Helper.bindKeyShortcutEvent($container, '.submit_btn.app_btn');
                Helper.checkFormToDisableSubmitBtn($container.find('#app_settings_body input, #app_settings_body select'), $container.find('.submit_btn.app_btn'));
            });
            $container.find('#change_password').off('click').on('click', () => {
                $container.find('section.password_section').toggle();
            });
            $container.find('#sideMenuActive').off('click').on('click', () => {
                $container.find('section.side_menu_position').toggle();
            });
            
            // Handle submit button according to changed form data in default Account settings page
            Helper.bindKeyShortcutEvent($container, '.submit_btn.account_btn');
            Helper.checkFormToDisableSubmitBtn($container.find('#account_settings_body input, #account_settings_body select'), $container.find('.submit_btn.account_btn'));
        }
    }

    login() {
        let data = {
            email: this.$loginEmail.val(),
            password: this.$loginPassword.val()
        };

        dataProvider.provide('login', data).done((response) => {
            if (response.Id && response.UserName) {
                this.user = new User(response);
                mediator.publish('UserLogin');
            }
            else if (response == ERROR.Input) {
                this.$loginMsg.text('Please, enter all information.');
            }
            else if (response == ERROR.Email) {
                this.$loginMsg.text('Email format is not valid.');
            }
            else if (response == ERROR.Unregistered) {
                this.$loginMsg.text('You are not registered yet.');
            }
            else if (response == ERROR.Brute) {
                this.$loginMsg.text('Your account is blocked.');
            }
            else if (response == ERROR.Password) {
                this.$loginMsg.text('Wrong password, please try it again.');
            }
            else {
                this.$loginMsg.text('Login failed, please try again later.');
            }
        });
    }
    _logOut(msg) {
        msg = typeof msg == 'string' ? msg : 'You have been successfully logged out.';
        dataProvider.provide('logout').done((response) => {
            if (response) {
                this.renderLogin(msg);
            }
        });
        this.$loginEmail.val('');
        this.$loginPassword.val('');
        mediator.publish('UserLogout');
    }
    register() {
        // TODO: Show password strength
        let data = {
            user_name: this.$userName.val(),
            email: this.$regEmail.val(),
            password: this.$regPassword.val(),
            password_confirm: this.$regPasswordConfirm.val()
        };

        dataProvider.provide('register', data).done((response) => {
            if (response == ERROR.OK) {  // new user was created successfully
                renderLogin('You were successfully registered, please login with your credentials.');
            }
            else if (response == ERROR.Input) {
                this.$regMsg.text('Please, enter all information.');
            }
            else if (response == ERROR.Email) {
                this.$regMsg.text('Email format is not valid.');
            }
            else if (response == ERROR.EqualPasswords) {
                this.$regMsg.text('Passwords don`t match, please, enter them again.');
            }
            else if (response == ERROR.Registered) {
                this.$regMsg.text('You are already registered. Please login with this email.');
            }
            else {
                this.$regMsg.text('New user failed to create!');
            }
        });

    }

    _editAccount() {
        let userName = this.$modal.find('#userName').val().trim(),
            email = this.$modal.find('#email').val().trim(),
            changePassword = this.$modal.find('#change_password').is(':checked'),
            data = {
                user_name: userName,
                email: email,
                change_password: changePassword
            };
        if (changePassword) {
            data['password_old']     = this.$modal.find('#password_old').val().trim();
            data['password_new']     = this.$modal.find('#password_new').val().trim();
            data['password_confirm'] = this.$modal.find('#password_confirm').val().trim();
        }

        dataProvider.provide('editAccount', data).done((response) => {
            let $resultMsg = this.$modal.find('#edit_account_result_msg');
            if (response == ERROR.OK) {
                // Update Account Model
                this.user.userName = userName;
                this.user.email = email;

                this._renderMenuItem();
                mediator.publish('SetResultMessage', 'Your account info was successfully edited.');
                this.$modal.modal('hide');
            }
            else if (response == ERROR.Input) {
                $resultMsg.text('Some required form data are missing.');
            }
            else if (response == ERROR.Login) {
                this.$modal.modal('hide');
                this._logOut('You were unexpectedly logged out.');
            }
            else if (response == ERROR.Email) {
                $resultMsg.text('Email has a wrong format (example@host.com).');
            }
            else if (response == ERROR.Registered) {
                $resultMsg.text('You can not use this email, please try something else.');
            }
            else if (response == ERROR.Password) {
                $resultMsg.text('Current password is wrong.');
            }
            else if (response == ERROR.EqualPasswords) {
                $resultMsg.text('New passwords do not equal.');
            }
        });
    }
	_editAppSettings() {
        let themeColor = this.$modal.find('#themeColor').val(),
            sideMenuActive = this.$modal.find('#sideMenuActive').is(':checked'),
		    data = {
                app_settings: {
                    theme: { color: themeColor },
                    sideMenu: { active: sideMenuActive }
                }
            };
		if (sideMenuActive) {
			data.app_settings.sideMenu.position = this.$modal.find('#sideMenuPosition').val();
		}
		
        dataProvider.provide('editAppSettings', data).done((response) => {
            let $resultMsg = this.$modal.find('#edit_account_result_msg');
            if (response == ERROR.OK) {
                // Update Account Model
                this.user.appSettings = {
                    theme: { color: themeColor },
                    sideMenu: {
                        active: sideMenuActive,
                        position: data.app_settings.sideMenu.position
                    }
                };

                mediator.publish('ReloadPageLayout', this.user.appSettings);
                mediator.publish('SetResultMessage', 'Your app settings were successfully edited.');
                this.$modal.modal('hide');
            }
            else if (response == ERROR.Input) {
                $resultMsg.text('Some required form data are missing.');
            }
            else if (response == ERROR.Login) {
                this.$modal.modal('hide');
                this._logOut('You were unexpectedly logged out.');
            }
        });
	}

}