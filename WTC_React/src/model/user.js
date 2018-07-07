import { dataProvider } from '../services/DataProvider';
import { ERROR } from '../constants';

/**
 * User model and logic related to it
 */
class User {
    constructor() {
        this.id          = null;
        this.userName    = null;
        this.email       = null;
        this.appSettings = null;

        // this.isUserLoggedIn = this.isUserLoggedIn.bind(this);
        // this.logIn = this.logIn.bind(this);
        // this.register = this.register.bind(this);
        // this.getProp = this.getProp.bind(this);
    }

    /**
     * Set User model data
     * @param {JSON} userData Data for User model
     */
    _setUser(userData) {
        this.id          = userData.Id;
        this.userName    = userData.UserName;
        this.email       = userData.Email;
        this.appSettings = JSON.parse(userData.AppSettings);
    }
    // Check if user is logged in
    isUserLoggedIn() {
        return dataProvider.provide('checkLogin')
            .then((response) => {
                if (response){
                    // Define user model
                    this._setUser(response);

                    return true;
                }
                
                return false;
            });
    }

    logIn(data) {
        return dataProvider.provide('login', data)
            .then((response) => {
                if (response.Id && response.UserName) {
                    //this.user = new User(response);
                    //mediator.publish('UserLogin');

                    this._setUser(response);
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
    logOut() {
        return dataProvider.provide('logout');
    }
    register(data) {
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

    // getId(){
    //     return this.id || false;
    // }
    getProp(name) {
        return this[name];
    }
	// isSideMenuActive() {
    //     return this.appSettings.sideMenu.active;
    // }
}

let user = new User();

// Public methods exposed through userProxy
const userProxy = {
    isUserLoggedIn: user.isUserLoggedIn.bind(user)
};
//userProxy.isUserLoggedIn = user.isUserLoggedIn.bind(user);
userProxy.register = user.register.bind(user);
userProxy.logIn = user.logIn.bind(user);
userProxy.logOut = user.logOut.bind(user);
userProxy.getUserProp = user.getProp.bind(user);

export default userProxy;