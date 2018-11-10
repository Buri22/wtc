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
        this.appSettings = new AppSettingsModel(userData.AppSettings);
    }
    setProp(name, value) {
        this[name] = value;
    }
    getProp(name) {
        return this[name];
    }

}

class AppSettingsModel {
    constructor(data) {
        let appData = JSON.parse(data);

        this.theme = { color: Number(appData.theme.color) };
        this.sideMenu = {
            active: appData.sideMenu.active,
            position: Number(appData.sideMenu.position)
        };
    }
}

let user = new User();

// Public methods exposed through userProxy
const userProxy = {
    setUser: user.setUser.bind(user),
    setProp: user.setProp.bind(user),
    getProp: user.getProp.bind(user)
};

export default userProxy;