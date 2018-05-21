export default class User {
    constructor(userData) {
        this.id = userData.Id;
        this.userName = userData.UserName;
        this.email = userData.Email;
        this.appSettings = JSON.parse(userData.AppSettings);
    }

    
    getId() {
        return this.id || false;
    }
	getAppSettings() {
		return this.appSettings;
	}
}