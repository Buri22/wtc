import DateTimeHelper from '../services/DateTimeHelper';
import Mediator from '../services/Mediator';

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
        this.categoryId  = taskData.CategoryId;
    }

    spentTimeInHms() {
        return DateTimeHelper.secondsToHms(this.spentTime);
    }
}

/**
 * Wrapper for list of Tasks
 */
class TaskListWrapper {

    constructor() {
        this.taskList = null;

        // Subscribe for global events
        Mediator.subscribe('Logout', this.clearTaskList.bind(this));
    }

    setTaskList(taskList) {
        this.taskList = taskList;
    }
    setTask(task) {
        this.taskList[this.taskList.findIndex(x => x.id == task.id)] = task;
    }
    clearTaskList() {
        this.taskList = null;
    }
    addTask(task) {
        this.taskList.unshift(new Task(task));
    }
    removeTask(id) {
        this.taskList.splice(this.getTaskIndexById(id), 1);
    }
    getTasklist() {
        return this.taskList;
    }
    // getTask(taskIndex) {
    //     return this.taskList[taskIndex];
    // }
    getTaskById(id) {
        return this.taskList[this.getTaskIndexById(id)];
    }
    /**
     * Returns false when taskList is not loaded
     * Returns undefined when there is no task ticking
     * Returns ticking task if there is one
     */
    getTaskActive() {
        if (this.taskList == null) {
            return false;
        }
        return this.taskList[this.taskList.findIndex(x => x.taskStarted == 1)];
    }
    getTaskActiveId() {
        let activeTask = this.getTaskActive() || null;
        return activeTask != null ? activeTask.id : null;
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
}

let TLWrapper = new TaskListWrapper();

// Public methods exposed through taskListProxy
const TaskList = {
    setTaskList:         TLWrapper.setTaskList.bind(TLWrapper),
    setTask:             TLWrapper.setTask.bind(TLWrapper),
    //clearTaskList:       TLWrapper.clearTaskList.bind(TLWrapper),
    addTask:             TLWrapper.addTask.bind(TLWrapper),
    removeTask:          TLWrapper.removeTask.bind(TLWrapper),
    getTasklist:         TLWrapper.getTasklist.bind(TLWrapper),
    //getTask:             TLWrapper.getTask.bind(TLWrapper),
    getTaskById:         TLWrapper.getTaskById.bind(TLWrapper),
    getTaskActive:       TLWrapper.getTaskActive.bind(TLWrapper),
    getTaskActiveId:     TLWrapper.getTaskActiveId.bind(TLWrapper),
    getTaskIndexById:    TLWrapper.getTaskIndexById.bind(TLWrapper),
    getLength:           TLWrapper.getLength.bind(TLWrapper),
    isLoaded:            TLWrapper.isLoaded.bind(TLWrapper)
};

export { TaskList, Task };