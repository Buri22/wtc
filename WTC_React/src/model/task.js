import { dataProvider } from '../services/DataProvider';

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
    spentTimeToSeconds() {
        let hms_time = this.spentTime.split(":");
        return Number(hms_time[2]) + Number(hms_time[1]) * 60 + Number(hms_time[0]) * 60 * 60;
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
    getTaskIndexById(id) {
        return this.taskList.findIndex(x => x.id == id);
    }
    getLength() {
        return this.taskList.length;
    }
    hasTaskList() {
        if (taskList.getTasklist() == undefined) {
            return true;
        }
        return false;
    }
}

let taskList = new TaskList();

// Public methods exposed through taskListProxy
const taskListProxy = {
    loadTaskList:     taskList.loadTaskList.bind(taskList),
    addTask:          taskList.addTask.bind(taskList),
    removeTask:       taskList.removeTask.bind(taskList),
    getTasklist:      taskList.getTasklist.bind(taskList),
    getTask:          taskList.getTask.bind(taskList),
    getTaskById:      taskList.getTaskById.bind(taskList),
    getTaskIndexById: taskList.getTaskIndexById.bind(taskList),
    getLength:        taskList.getLength.bind(taskList),
    hasTaskList:      taskList.hasTaskList.bind(taskList)
};

export default taskListProxy;