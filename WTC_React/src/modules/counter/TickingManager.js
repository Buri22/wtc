import { dataProvider } from '../../services/DataProvider';
import { ERROR } from '../../constants';
import LocalStorage from '../../model/localStorage';
import taskList from '../../model/task';

class TickingManager {
    constructor() {
        this.renderTicking = null;      // callback function that renders ticking in Counter
        this.doRenderTicking = true;    // Boolean indicating whether render ticking is needed
        this.isItemTicking = false;     // Boolean indicating whether item is ticking
    }

    _startWTCTicker(task) {
        // Create LocalStorage data object
        LocalStorage.setItem(task);
        // Create window object that will tick
        window.wtcTicker = setInterval(() => {
            this._executeTick();
        }, 1000);
        this._executeTick();
        this.isItemTicking = true;
    }
    _executeTick() {
        let LSTickingItem = LocalStorage.getItem();
        if (LSTickingItem == null) { 
            console.log('Class: TickingManager; Method: _executeTick(); LocalStorage ticking item is null.');
        }
        else {
            // LocalStorage Object exists
            let task;

            if (!taskList.isLoaded()) {
                // taskList is empty or user is logged out
                task = {
                    id: LSTickingItem.task_id,
                    spentTime: LSTickingItem.spent_time + 1 // add 1 second
                };
            }
            else {
                task = taskList.getTaskById(LSTickingItem.task_id)
                task.spentTime = LSTickingItem.spent_time + 1; // add 1 second
            }

            // update spent time in LS
            LocalStorage.setItem(task);

            if (this.doRenderTicking) {
                // rerender spent time
                this.renderTicking(task);
            }
        }
    }
    checkTickingItem(renderTickingCallback) {
        if (this.isItemTicking) return;

        let LSTickingItem = LocalStorage.getItem() || null;
        let TLTickingItem = taskList.getTaskActive() || null;

        if (LSTickingItem != null || TLTickingItem != null) {
            if (LSTickingItem != null && TLTickingItem != null && TLTickingItem.id == LSTickingItem.task_id)
            {
                TLTickingItem.spentTime = LSTickingItem.spent_time;
            }
            else if (LSTickingItem != null) {
                TLTickingItem = {
                    id: LSTickingItem.task_id,
                    spentTime: LSTickingItem.spent_time
                };
            }

            this.renderTicking = renderTickingCallback; // we should render ticking
            this._startWTCTicker(TLTickingItem);         // start ticking
        }
    }

    // Set property defining if we do render ticking
    switchRenderTicking(bool, renderTickingCallback = null) {
        if (renderTickingCallback) {
            this.renderTicking = renderTickingCallback;
        }
        this.doRenderTicking = bool;
    }
    
    startTicking(id, renderTickingCallback) {
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
                        this.renderTicking = renderTickingCallback;
                        // Update model
                        let task = taskList.getTaskById(id);
                        task.taskStarted = 1;
                        task.lastStart = data.last_start;
                        // Set interval for ticking
                        this._startWTCTicker(task);

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
                        // Remove LS object
                        LocalStorage.removeItem();
                        // Clear window.wtcTicker
                        clearInterval(window.wtcTicker);   // Stop ticking
                        this.isItemTicking = false;
                        // mediator.publish('RemoveItemFromSideMenu', this.$sideMenuItem.attr('id'));
                        
                        return {success: true, msg: '<strong>' + task.name + '</strong> stopped successfully!'};
                    }
                    else {
                        return {msg: 'Stopping failed!'};
                    }
                });

    }

    isTicking() {
        return this.isItemTicking;
    }
}

let tickingManager = new TickingManager();

// Public methods exposed through tickingManagerProxy
const tickingManagerProxy = {
    startTicking:         tickingManager.startTicking.bind(tickingManager),
    stopTicking:          tickingManager.stopTicking.bind(tickingManager),
    checkTickingItem:     tickingManager.checkTickingItem.bind(tickingManager),
    switchRenderTicking:  tickingManager.switchRenderTicking.bind(tickingManager),
    isTicking:            tickingManager.isTicking.bind(tickingManager)
};

export default tickingManagerProxy;