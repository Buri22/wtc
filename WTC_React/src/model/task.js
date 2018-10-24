import { dataProvider } from '../services/DataProvider';
import { ERROR } from '../constants';

import LocalStorage from './localStorage';

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
    getTask(i) {
        return this.taskList[i];
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
    startTicking(id) {
        let taskIndex = this.taskList.findIndex(x => x.id == id),
            task = this.taskList[taskIndex],
            data = {
                task_id: task.id,
                last_start: Math.round(new Date().getTime() / 1000) // We store time in seconds
            };


        return dataProvider.provide("startTask", data)
                .then((response) => {
                    if (response == ERROR.Input) {
                        console.log('Parameters to start the task are missing.');
                        return { msg: 'Parameters to start the task are missing.' };
                    }
                    else if (response == ERROR.Logout) {    // User isn`t logged in
                        console.log('You were unexpectedly logged out.');
                        return { msg: 'You were unexpectedly logged out.' };
                    }
                    else if (response.someTaskAlreadyStarted) {
                        console.log(`You are already working on <strong>${this.taskList.findIndex(x => x.id == response.Id) + 1}. ${response.Name}</strong>`);
                        return { msg: `You are already working on <strong>${this.taskList.findIndex(x => x.id == response.Id) + 1}. ${response.Name}</strong>` };
                    }
                    else if (response.Id) {
                        console.log(response);

                        // Update model
                        task.taskStarted = 1;
                        task.lastStart = data.last_start;
                        // Update LocalStorage
                        LocalStorage.setItem(this.taskList[taskIndex]);

                        return {success: true, msg: 'Started successfully!'};
                        // this.$activeListItem = this.$itemList.find('li[data-id="' + itemIndex + '"]');
                        // this.startMyTimer(response);

                        // this.setActiveTaskListItem();
                        // mediator.publish('AddItemToSideMenu', this.getTickingSideMenuItem(itemIndex));
                    }
                    else {
                        console.log('Failed to start this task.');
                        return { msg: 'Failed to start this task.' };
                    }
                });

    }
    stopTicking(id) {
        
        let taskIndex = this.taskList.findIndex(x => x.id == id),
            task = this.taskList[taskIndex],
            data = LocalStorage.getItem();

        // if data object is null or we try to stop task that is not ticking
        if (data == null || typeof data.task_id === undefined || typeof data.spent_time === undefined
            || data.task_id != task.id) {
            data = { 'task_id': task.id };
        }

        return dataProvider.provide("stopTask", data)
                .then((response) => {
                    if (response == ERROR.LogOut) {    // User isn`t logged in
                        console.log('You were unexpectedly logged out.');
                        return {msg: 'You were unexpectedly logged out.'};
                    }
                    else if (response == ERROR.TaskStarted) {
                        console.log('You have to start some task first.');
                        return {msg: 'You have to start some task first.'};
                    }
                    else if (response == ERROR.Input) {
                        console.log('Parameters to stop the task are missing.');
                        return {msg: 'Parameters to stop the task are missing.'};
                    }
                    else if(response.otherTaskStarted) {
                        console.log(`You are already working on <strong>${this.taskList.findIndex(x => x.id == response.Id) + 1}. ${response.Name}</strong>`);
                        return {msg: `You are already working on <strong>${this.taskList.findIndex(x => x.id == response.Id) + 1}. ${response.Name}</strong>`};
                    }
                    else if (response) {
                        console.log(response);
                
                        // Update model
                        task.spentTime = response.SpentTime || 0;
                        task.taskStarted = 0;

                        LocalStorage.removeItem();

                        // clearInterval(window.myTime);   // Stop ticking
                        // this.unsetActiveTaskListItem();
                        // mediator.publish('RemoveItemFromSideMenu', this.$sideMenuItem.attr('id'));
                        // this.activeItemIndex = null;
                        
                        return {success: true, msg: '<strong>' + task.name + '</strong> stopped successfully!'};
                    }
                    else {
                        console.log('Stopping failed!');
                        return {msg: 'Stopping failed!'};
                    }
                });

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
    hasTaskList:  taskList.hasTaskList.bind(taskList),
    startTicking: taskList.startTicking.bind(taskList),
    stopTicking:  taskList.stopTicking.bind(taskList)
};

export default taskListProxy;