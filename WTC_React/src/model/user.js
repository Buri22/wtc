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
    }

    /**
     * Set User model data
     * @param {JSON} userData Data for User model
     */
    setUser(userData) {
        this.id          = userData.Id;
        this.userName    = userData.UserName;
        this.email       = userData.Email;
        this.appSettings = JSON.parse(userData.AppSettings);
    }
    // Check if user is logged in
    isUserLoggedIn() {
        return dataProvider.provide('checkLogin')
            .then((response) => {
                if (response.data){
                    // Define user model
                    this.setUser(response.data);

                    return true;
                }
                
                return false;
            });
    }

    logIn(data) {
        return dataProvider.provide('login', data)
            .then((response) => {
                if (response.data.Id && response.data.UserName) {
                    //this.user = new User(response);
                    //mediator.publish('UserLogin');

                    this.setUser(response.data);
                    return { success: true };
                }
                else if (response.data === ERROR.Input) {
                    //this.$loginMsg.text('Please, enter all information.');
                    return { msg: 'Please, enter all information.' };
                }
                else if (response.data === ERROR.Email) {
                    //this.$loginMsg.text('Email format is not valid.');
                    return { msg: 'Email format is not valid.' };
                }
                else if (response.data === ERROR.Unregistered) {
                    //this.$loginMsg.text('You are not registered yet.');
                    return { msg: 'You are not registered yet.' };
                }
                else if (response.data === ERROR.Brute) {
                    //this.$loginMsg.text('Your account is blocked.');
                    return { msg: 'Your account is blocked.' };
                }
                else if (response.data === ERROR.Password) {
                    //this.$loginMsg.text('Wrong password, please try it again.');
                    return { msg: 'Wrong password, please try it again.' };
                }
                else {
                    //this.$loginMsg.text('Login failed, please try again later.');
                    return { msg: 'Login failed, please try again later.' };
                }
            });
    }

    getId(){
        return this.id || false;
    }
	isSideMenuActive() {
        return this.appSettings.sideMenu.active;
    }
}

export let user = new User();