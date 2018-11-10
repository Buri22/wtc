import { dataProvider } from './DataProvider';
import { ERROR } from '../constants';
import User from '../model/user';

/**
 * Handles comunication with DB about User
 * Updates User model
 */
export default class UserService {

    // Check if user is logged in
    static isUserLoggedIn() {
        return dataProvider.provide('checkLogin')
            .then((response) => {
                if (response){
                    // Define user model
                    User.setUser(response);

                    return true;
                }
                
                return false;
            });
    }

    static logIn(data) {
        return dataProvider.provide('login', data)
            .then((response) => {
                if (response.Id && response.UserName) {
                    //this.user = new User(response);
                    //mediator.publish('UserLogin');

                    User.setUser(response);
                    return { success: true };
                }
                else if (response === ERROR.Input) {
                    return { msg: 'Please, enter all information.' };
                }
                else if (response === ERROR.Email) {
                    return { msg: 'Email format is not valid.' };
                }
                else if (response === ERROR.Unregistered) {
                    return { msg: 'You are not registered yet.' };
                }
                else if (response === ERROR.Brute) {
                    return { msg: 'Your account is blocked.' };
                }
                else if (response === ERROR.Password) {
                    return { msg: 'Wrong password, please try it again.' };
                }
                else {
                    return { msg: 'Login failed, please try again later.' };
                }
            });
    }
    static logOut() {
        return dataProvider.provide('logout');
    }
    
    static register(data) {
        return dataProvider.provide('register', data)
            .then((response) => {
                if (response === ERROR.OK) {  // new user was created successfully
                    return { success: true, msg: 'You were successfully registered, please login with your credentials.' };
                }
                else if (response === ERROR.Input) {
                    return { msg: 'Please, enter all information.' };
                }
                else if (response === ERROR.Email) {
                    return { msg: 'Email format is not valid.' };
                }
                else if (response === ERROR.EqualPasswords) {
                    return { msg: 'Passwords don`t match, please, enter them again.' };
                }
                else if (response === ERROR.Registered) {
                    return { msg: 'You are already registered. Please login with this email.' };
                }
                else {
                    return { msg: 'New user failed to create!' };
                }
            });
    }

    static editAccountData(data) {
        return dataProvider.provide('editAccount', data)
            .then((response) => {
                if (response === ERROR.OK) {
                    // Update Account Model
                    User.setProp('userName', data.userName);
                    User.setProp('email', data.email);
    
                    return { success: true, msg: 'Your account was successfully edited.' };
                }
                else if (response === ERROR.Input) {
                    return { msg: 'Some required form data are missing.' };
                }
                else if (response === ERROR.Login) {
                    return { success: false, msg: 'You were unexpectedly logged out.' };
                }
                else if (response === ERROR.Email) {
                    return { msg: 'Email has a wrong format (example@host.com).' };
                }
                else if (response === ERROR.Registered) {
                    return { msg: 'You can not use this email, please try something else.' };
                }
                else if (response === ERROR.Password) {
                    return { msg: 'Current password is wrong.' };
                }
                else if (response === ERROR.EqualPasswords) {
                    return { msg: 'New passwords do not equal.' };
                }
            });
    }

    static editAppData(data) {
        let updatedAppSettings = {
            theme: { color: data.themeColor },
            sideMenu: {
                active: data.sideMenuIsActive,
                position: data.sideMenuPosition
            }
        };

        return dataProvider.provide('editAppSettings', {
                app_settings: JSON.stringify(updatedAppSettings)
            })
            .then((response) => {
                if (response === ERROR.OK) {
                    // Update Account Model
                    User.setProp('appSettings', updatedAppSettings);

                    //mediator.publish('ReloadPageLayout', this.user.appSettings);
                    //mediator.publish('SetResultMessage', 'Your app settings were successfully edited.');
                    return { success: true, msg: 'Your settings was successfully edited.' };
                }
                else if (response === ERROR.Input) {
                    return { msg: 'Some required form data are missing.' };
                }
                else if (response === ERROR.Login) {
                    return { success: false, msg: 'You were unexpectedly logged out.' };
                }
            });
    }
}