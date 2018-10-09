import { dataProvider } from '../services/DataProvider';
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
        let h = Math.floor(this.spentTime / 3600);
        let m = Math.floor(this.spentTime % 3600 / 60);
        let s = Math.floor(this.spentTime % 3600 % 60);
        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
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
    getTask(i) {
        return this.taskList[i];
    }
    getLength() {
        return this.taskList.length;
    }
}

let taskList = new TaskList();

// Public methods exposed through taskListProxy
const taskListProxy = {
    loadTaskList: taskList.loadTaskList.bind(taskList),
    addTask:      taskList.addTask.bind(taskList),
    removeTask:   taskList.removeTask.bind(taskList),
    getTasklist:  taskList.getTasklist.bind(taskList),
    getTask:      taskList.getTask.bind(taskList),
    getLength:    taskList.getLength.bind(taskList),
};

export default taskListProxy;