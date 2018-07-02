import { dataProvider } from '../services/DataProvider';

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
        dataProvider.provide('checkLogin')
            .then((response) => {
                if (response.data){
                    // Define user model
                    this.setUser(response.data);

                    return true;
                }
                
                return false;
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