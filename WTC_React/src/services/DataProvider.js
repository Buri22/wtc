import axios from 'axios';

/**
 * Provides data from database via ajax call
 */
class DataProvider {

    constructor() {
        /**
         * 
         */
        this.getActions = {}

        // Set Axios default request params
        axios.defaults.baseURL = 'http://www.localhost/WTC_JS_OOP/WTC_React';
        axios.defaults.method = 'post';
        axios.defaults.url = '/server/wtc_ajax.php';
        axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
        axios.defaults.headers.post['X-Requested-With'] = 'xmlhttprequest';
    }
    
    // Method to provide data from one module to other module that need it
    register(getAction, object, func) {
        this.getActions[getAction] = {
            context: object,
            func: func
        };
    }

    getValue(getAction) {
        if (!this.getActions[getAction]) {
            return false;
        }

        // The last registered getAction is executed and its return value is returned
        let reg = this.getActions[getAction];
        return reg.func.apply(reg.context);
    }

    /**
     * Method provides action call to server
     * @param {String} action name of the action to be performed at server
     * @param {JSON} data POST request data
     */
    provide(action, data = {}) {
        let bodyFormData = new FormData();
        for (let key in data) {
            bodyFormData.set(key, data[key]);
        }        
        return axios({
                headers: {
                    'Ajax-Action': action
                },
                data: bodyFormData
            })
            .then((response) => {
                return response.data
            })
            .catch(function (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
            });
    }
    

}

export var dataProvider = new DataProvider();