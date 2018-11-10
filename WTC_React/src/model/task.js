import { dataProvider } from '../services/DataProvider';
import DateTimeHelper from '../services/DateTimeHelper';
import { ERROR } from '../constants';

/**
 * Task model
 */
class Task {
    constructor(taskData) {
        this.id          = taskData.Id;
        this.name        = taskData.Name;
        this.lastStart   = taskData.LastStart;
        this.spentTime   = taskData.SpentTime;
        this.taskStarted = taskData.TaskStarted;
        this.dateCreated = taskData.DateCreated;
    }

    spentTimeInHms() {
        return DateTimeHelper.secondsToHms(this.spentTime);
    }
}

/**
 * Wrapper for list of Tasks
 */
class TaskList {

    constructor() {
        this.taskList = null;
    }

    loadTaskList() {
        return dataProvider.provide('getTaskList')
            .then((taskListData) => {
                if (taskListData) {
                    this.taskList = Array.from(taskListData, taskData => new Task(taskData));
                    return { success: true };
                }
                else {  // Just in case user is not logged in
                    console.log('user is not logged in and we try to initialize taskList... ??? this should not happen!');
                    return { success: false };
                    //mediator.publish('RenderLogin', 'You were logged out, please login again.');
                }
            });
    }
    clearTaskList() {
        this.taskList = null;
    }
    addTask(task) {
        this.taskList.unshift(new Task(task));
    }
    removeTask(taskIndex) {
        this.taskList.splice(taskIndex, 1);
    }
    getTasklist() {
        return this.taskList;
    }
    getTask(taskIndex) {
        return this.taskList[taskIndex];
    }
    getTaskById(id) {
        return this.taskList[this.taskList.findIndex(x => x.id == id)];
    }
    getTaskActive() {
        if (this.taskList == null) {
            return false;
        }
        return this.taskList[this.taskList.findIndex(x => x.taskStarted == 1)];
    }
    getTaskIndexById(id) {
        return this.taskList.findIndex(x => x.id == id);
    }
    getLength() {
        return this.taskList.length;
    }
    isLoaded() {
        if (this.taskList !== null) {
            return true;
        }
        return false;
    }
    
    createTask(data) {
        return dataProvider.provide("createTask", data)
            .then((response) => {
                if (response.Name == data.new_name) {
                    // Update model
                    this.addTask(response);     // Adds created Task to the beginning of taskList

                    return { success: true, msg: 'New task was successfully created!' };
                }
                else if (response == ERROR.Input) {
                    return { msg: 'Please input some creative task name.' };
                }
                else if (response == ERROR.Login) {
                    return { msg: 'Please input some creative task name.', logout: true };
                }
                else if (response == ERROR.TaskName) {
                    return { msg: 'This task name already exists, try something different.' };
                }
                else if (response == ERROR.TaskSpentTime) {
                    return { msg: 'Please insert Spent Time in as valid time format (hh:mm:ss).' };
                }
                else if (response == ERROR.TaskDateCreated) {
                    return { msg: 'Please insert Date Created as as valid date format (dd.mm.yyyy).' };
                }
                else {
                    return { msg: 'New task name failed to create!', modalHide: true };
                }
            });
    }
}

let taskList = new TaskList();

// Public methods exposed through taskListProxy
const taskListProxy = {
    loadTaskList:        taskList.loadTaskList.bind(taskList),
    clearTaskList:       taskList.clearTaskList.bind(taskList),
    addTask:             taskList.addTask.bind(taskList),
    removeTask:          taskList.removeTask.bind(taskList),
    getTasklist:         taskList.getTasklist.bind(taskList),
    getTask:             taskList.getTask.bind(taskList),
    getTaskById:         taskList.getTaskById.bind(taskList),
    getTaskActive:       taskList.getTaskActive.bind(taskList),
    getTaskIndexById:    taskList.getTaskIndexById.bind(taskList),
    getLength:           taskList.getLength.bind(taskList),
    isLoaded:            taskList.isLoaded.bind(taskList),
    createTask:          taskList.createTask.bind(taskList)
};

export default taskListProxy;