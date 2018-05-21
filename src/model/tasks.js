/**
 * Model of the task item
 */
var Tasks = function() {
    var tasks = null;

    // Load Task data
    function _loadTaskData() {
        DataProvider.provide('getTaskList').done(function (taskListData) {
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
    mediator.subscribe('UserLogout', clearDataModel);
    return {
        getItems: getTasks
    };
};

// class Task {
//     constructor() {

//     }
// }