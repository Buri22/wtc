/**
 * Provides data from database via ajax call
 */
class DataProvider {

    constructor() {
        /**
         * 
         */
        this.getActions = {}
    }
    
    // TODO: create method to provide data from one module to other module that need it
    register(getAction, object, func) {
        this.getActions[getAction] = {
            context: object,
            func: func
        };
    }

    getValue(getAction) {
        if (!this.getActions['Get' + getAction]) {
            return false;
        }

        // The last registered getAction is executed and its return value is returned
        let reg = this.getActions['Get' + getAction];
        return reg.func.apply(reg.context);
    }

    /**
     * Method provides action call to server
     * @param {String} action name of the action to be performed at server
     * @param {JSON} data POST request data
     * @param {String} type HTTP request type
     */
    provide(action, data = {}, type = 'POST') {
        // Define request headers
        var headers = {
            'Ajax-Action': action
        };
        if (type == 'POST') {
            headers['Content-type'] = 'application/x-www-form-urlencoded';
        }

        return $.ajax({
            url: 'includes/wtc_ajax.php',
            headers: headers,
            type: type,
            data: data,
            dataType: 'json'
        });
    }

}

export var dataProvider = new DataProvider();