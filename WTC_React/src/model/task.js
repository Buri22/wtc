import { dataProvider } from '../services/DataProvider';
import DateTimeHelper from '../services/DateTimeHelper';

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
        this.taskList;
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
        if (this.taskList == undefined) {
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
    isTaskListUndefined() {
        if (taskList.getTasklist() == undefined) {
            return true;
        }
        return false;
    }
}

let taskList = new TaskList();

// Public methods exposed through taskListProxy
const taskListProxy = {
    loadTaskList:        taskList.loadTaskList.bind(taskList),
    addTask:             taskList.addTask.bind(taskList),
    removeTask:          taskList.removeTask.bind(taskList),
    getTasklist:         taskList.getTasklist.bind(taskList),
    getTask:             taskList.getTask.bind(taskList),
    getTaskById:         taskList.getTaskById.bind(taskList),
    getTaskActive:       taskList.getTaskActive.bind(taskList),
    getTaskIndexById:    taskList.getTaskIndexById.bind(taskList),
    getLength:           taskList.getLength.bind(taskList),
    isTaskListUndefined: taskList.isTaskListUndefined.bind(taskList)
};

export default taskListProxy;