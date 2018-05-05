/**
 * Provides data from database via ajax call
 */
class DataProvider {

    /**
     * Method provides action call to server
     * @param {String} action name of the action to be performed at server
     * @param {JSON} data POST request data
     * @param {String} type HTTP request type
     */
    static provide(action, data = {}, type = 'POST') {
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