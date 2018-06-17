import {mediator} from '../mediator';

/**
 * Model of the task item
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

}

/**
 * Wrapper for list of Tasks
 */
export default class TaskList {

    /**
     * Constructor
     * @param {JSON} taskListData 
     */
    constructor(taskListData) {
        this.taskList = Array.from(taskListData, taskData => new Task(taskData));
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