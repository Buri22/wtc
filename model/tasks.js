/**
 * Created by Uživatel on 12.10.2017.
 */
var Tasks = function() {
    var tasks = null;

    // Load Task data
    function _loadTaskData() {
        Helper.ajaxCall("getTaskList", "POST", undefined, function(taskListData) {
            if (taskListData) {
                // Define task model
                tasks = taskListData;

                mediator.publish('CounterModelLoaded');
            }
            else {  // Just in case user is not logged in
                mediator.publish('RenderLogin', 'You were logged out, please login again.');
            }
        });
    }
    _loadTaskData();

    function getTasks() {
        return tasks;
    }
    function clearDataModel () {
        tasks = null;
    }

    mediator.subscribe('UserLogin', _loadTaskData);
    return {
        getItems: getTasks,
        clearDataModel: clearDataModel
    };
};