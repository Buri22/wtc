import { dataProvider } from '../../services/DataProvider';
import { ERROR } from '../../constants';
import LocalStorage from '../../model/localStorage';
import taskList from '../../model/task';

class TickingManager {
    
    startTicking(id) {
        let data = {
            task_id: id,
            last_start: Math.round(new Date().getTime() / 1000) // We store time in seconds
        };

        return dataProvider.provide("startTask", data)
                .then((response) => {
                    if (response == ERROR.Input) {
                        return { msg: 'Parameters to start the task are missing.' };
                    }
                    else if (response == ERROR.Logout) {    // User isn`t logged in
                        return { msg: 'You were unexpectedly logged out.' };
                    }
                    else if (response.someTaskAlreadyStarted) {
                        return { msg: `You are already working on <strong>${taskList.getTaskIndexById(response.Id) + 1}. ${response.Name}</strong>` };
                    }
                    else if (response.Id) {
                        // Update model
                        let task = taskList.getTaskById(id);
                        task.taskStarted = 1;
                        task.lastStart = data.last_start;
                        // Create LocalStorage data object
                        LocalStorage.setItem(task);
                        
                        // this.startMyTimer(response);
                        // mediator.publish('AddItemToSideMenu', this.getTickingSideMenuItem(itemIndex));

                        return {success: true, msg: 'Started successfully!'};
                    }
                    else {
                        return { msg: 'Failed to start this task.' };
                    }
                });

    }

    stopTicking(id) {
        let task = taskList.getTaskById(id),
            data = LocalStorage.getItem();

        // if LS data object is null or we try to stop task that is not ticking
        if (data == null || typeof data.task_id === undefined || typeof data.spent_time === undefined
            || data.task_id != task.id) {
            data = { 'task_id': task.id };
        }

        return dataProvider.provide("stopTask", data)
                .then((response) => {
                    if (response == ERROR.LogOut) {    // User isn`t logged in
                        return {msg: 'You were unexpectedly logged out.'};
                    }
                    else if (response == ERROR.TaskStarted) {
                        return {msg: 'You have to start some task first.'};
                    }
                    else if (response == ERROR.Input) {
                        return {msg: 'Parameters to stop the task are missing.'};
                    }
                    else if(response.otherTaskStarted) {
                        return {msg: `You are already working on <strong>${taskList.getTaskIndexById(response.Id) + 1}. ${response.Name}</strong>`};
                    }
                    else if (response) {                
                        // Update model
                        task.spentTime = response.SpentTime || 0;
                        task.taskStarted = 0;

                        LocalStorage.removeItem();

                        // clearInterval(window.myTime);   // Stop ticking
                        // mediator.publish('RemoveItemFromSideMenu', this.$sideMenuItem.attr('id'));
                        
                        return {success: true, msg: '<strong>' + task.name + '</strong> stopped successfully!'};
                    }
                    else {
                        return {msg: 'Stopping failed!'};
                    }
                });

    }
}

let tickingManager = new TickingManager();

// Public methods exposed through tickingManagerProxy
const tickingManagerProxy = {
    startTicking: tickingManager.startTicking.bind(tickingManager),
    stopTicking: tickingManager.stopTicking.bind(tickingManager)
};

export default tickingManagerProxy;