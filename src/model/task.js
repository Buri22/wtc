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

export default class TaskList {

    constructor(taskListData) {
        this.taskList = Array.from(taskListData, taskData => new Task(taskData));

        mediator.subscribe('UserLogout', this.clearDataModel.bind(this));
    }


    getTasklist() {
        return this.taskList;
    }
    clearDataModel () {
        this.taskList = null;
    }
}