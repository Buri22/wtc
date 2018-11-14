import { dataProvider } from './DataProvider';
import { ERROR } from '../constants';
import { TaskList, Task } from '../model/task';

/**
 * Handles comunication with DB about Task
 * Updates Task model
 */
export default class TaskService {
    
    static loadTaskList() {
        return dataProvider.provide('getTaskList')
            .then((taskListData) => {
                if (taskListData) {
                    TaskList.setTaskList(
                        Array.from(taskListData, taskData => new Task(taskData))
                    );
                    return { success: true };
                }
                else {  // Just in case user is not logged in
                    console.log('user is not logged in and we try to initialize taskList... ??? this should not happen!');
                    return { success: false };
                    //mediator.publish('RenderLogin', 'You were logged out, please login again.');
                }
            });
    }

    static createTask(data) {
        return dataProvider.provide("createTask", data)
            .then((response) => {
                if (response.Name == data.new_name) {
                    // Update model
                    TaskList.addTask(response);     // Adds created Task to the beginning of taskList

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

    static editTask(data) {
        return dataProvider.provide('editTask', data)
            .then((response) => {
                if (response.Name == data.new_name) {
                    // Update model
                    let updatedTask         = TaskList.getTaskById(data.item_id);
                    updatedTask.name        = response.Name;
                    updatedTask.spentTime   = response.SpentTime;
                    updatedTask.dateCreated = response.DateCreated;
                    TaskList.setTask(updatedTask);

                    return { success: true, msg: 'Task was successfully edited!' };
                }
                else if (response == ERROR.Input) {
                    return { msg: 'Please input some creative Name.' };
                }
                else if (response == ERROR.Login) {
                    return { msg: 'You were unexpectedly logged out.', logout: true };
                }
                else if (response == ERROR.TaskName) {
                    return { msg: 'This Name already exists, try something different.' };
                }
                else if (response == ERROR.TaskSpentTime) {
                    return { msg: 'Please insert Spent Time in as valid time format (hh:mm:ss).' };
                }
                else if (response == ERROR.TaskDateCreated) {
                    return { msg: 'Please insert Date Created as as valid date format (dd.mm.yyyy).' };
                }
                else {
                    return { msg: 'Edit task name failed!', modalHide: true };
                }
            });
    }

    static deleteTask(data) {
        return dataProvider.provide('deleteTask', data)
            .then((response) => {
                if (response == false) {
                    // Update model
                    TaskList.removeTask(data.task_id);

                    return { success: true, msg: 'Task was deleted successfully.' };
                }
                else if(response == ERROR.Input) {
                    return { msg: 'Some information is missing.' };
                }
                else if(response == ERROR.TaskMissing) {
                    return { msg: 'Record of current task is missing in database.', modalHide: true };
                }
                else if(response == ERROR.Password) {
                    return { msg: 'You entered wrong password.' };
                }
                else if(response == ERROR.TaskRunning) {
                    return { msg: 'You have to stop current task, to delete it.', modalHide: true };
                }
            });
    }
}