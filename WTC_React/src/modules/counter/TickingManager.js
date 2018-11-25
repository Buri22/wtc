import { dataProvider } from '../../services/DataProvider';
import { ERROR } from '../../constants';
import LocalStorage from '../../services/LocalStorageService';
import { TaskList } from '../../model/task';
import Mediator from '../../services/Mediator';

class TickingManager {
    constructor() {
        this.renderTicking = null;      // callback function that renders ticking in Counter
        this.stopCounterTicking = null  // callback function that renders no ticking task in Counter
        this.doRenderTicking = true;    // Boolean indicating whether render ticking is needed
        this.isItemTicking = false;     // Boolean indicating whether item is ticking

        // Subscribe for global events
        // TODO: nazvy eventu predelat do constants
        Mediator.subscribe('Logout', this.clearTickingObjects.bind(this));
    }

    _startWTCTicker(task) {
        this.isItemTicking = true;
        // Create LocalStorage data object
        LocalStorage.setItem(task);
        // Create window object that will tick
        window.wtcTicker = setInterval(() => {
            this._executeTick();
        }, 1000);
        this._executeTick();
    }
    _executeTick() {
        let LSTickingItem = LocalStorage.getItem() || null;

        if (TaskList.isLoaded()) {
            let TLTickingItem = TaskList.getTaskActive() || null;

            if (TLTickingItem == null) {
                this.clearTickingObjects();
                return;
            }
            else if (LSTickingItem != null) {
                // LocalStorage ticking object exists
                TLTickingItem.spentTime = LSTickingItem.spent_time + 1;
    
                // update spent time in LS
                LocalStorage.setItem(TLTickingItem);
    
                if (this.doRenderTicking) {
                    // rerender spent time
                    this.renderTicking(TLTickingItem);
                }
            }
            else {
                // Just TaskList ticking item exists
                TLTickingItem.spentTime = TLTickingItem.spentTime + 1;

                // Create LSTicking object
                LocalStorage.setItem(TLTickingItem);
    
                if (this.doRenderTicking) {
                    // rerender spent time
                    this.renderTicking(TLTickingItem);
                }
            }
                
            // In case sideMenu is active, this will update counterSideMenuItem
            Mediator.publish('UpdateModuleItem', 'Counter', {
                task: TLTickingItem,
                taskIndex: TaskList.getTaskIndexById(TLTickingItem.id) + 1,
                onStopBtnClick: this.stopTicking.bind(this)
            });
        }
        // TaskList is not loaded yet
        else if (LSTickingItem != null) {
            LocalStorage.setItem({
                id: LSTickingItem.task_id,
                spentTime: LSTickingItem.spent_time + 1 // add 1 second
            });
        }
        else {
            // TaskList is not loaded and LocalStorage object does not exist
            return;
        }
    }

    /**
     * Checks whether we have some ticking objects
     * Call this method only if you're sure that taskList is loaded
     */
    checkTickingItem() {
        // If we're already ticking, return
        if (this.isItemTicking) return;

        // Try to get ticking objects
        let LSTickingItem = LocalStorage.getItem() || null;
        let TLTickingItem = TaskList.getTaskActive() || null;

        // If one of them exists, we'll start ticking
        if (LSTickingItem != null || TLTickingItem != null) {
            if (LSTickingItem != null && TLTickingItem != null && TLTickingItem.id == LSTickingItem.task_id)
            {
                TLTickingItem.spentTime = LSTickingItem.spent_time;
            }
            else if (TLTickingItem != null) {
                // We have just the TaskList ticking object data
                TLTickingItem.spentTime = TLTickingItem.spentTime + Math.round(new Date().getTime() / 1000) - TLTickingItem.lastStart;
            }
            else if (LSTickingItem != null) {
                // We have just the LocalStorage ticking object data
                TLTickingItem = {
                    id: LSTickingItem.task_id,
                    spentTime: LSTickingItem.spent_time
                };
            }

            //this.renderTicking = renderTickingCallback; // we should render ticking
            this._startWTCTicker(TLTickingItem);        // start ticking
        }
    }

    /**
     * Set property defining if we do render ticking
     * This methos is called just when Counter component WillMount and WillUnmount
     * @param {Boolean} doRender 
     * @param {Function} renderTickingCallback 
     * @param {Function} stopCounterTicking 
     */
    switchRenderTicking(doRender, renderTickingCallback = null, stopCounterTicking = null) {
        if (renderTickingCallback) {
            this.renderTicking = renderTickingCallback;
        }
        if (stopCounterTicking) {
            this.stopCounterTicking = stopCounterTicking;
        }
        this.doRenderTicking = doRender;
    }
    
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
                        return { msg: `You are already working on <strong>${TaskList.getTaskIndexById(response.Id) + 1}. ${response.Name}</strong>` };
                    }
                    else if (response.Id) {
                        // Update model
                        let task = TaskList.getTaskById(id);
                        task.taskStarted = 1;
                        task.lastStart = data.last_start;
                        // Set interval for ticking
                        this._startWTCTicker(task);

                        Mediator.publish('UpdateModuleItem', 'Counter', {
                            task: task,
                            taskIndex: TaskList.getTaskIndexById(id),
                            onStopBtnClick: this.stopTicking.bind(this)
                        });

                        return {success: true, msg: 'Started successfully!'};
                    }
                    else {
                        return { msg: 'Failed to start this task.' };
                    }
                });

    }

    stopTicking(id) {
        let task = TaskList.getTaskById(id),
            data = LocalStorage.getItem();

        // if LS data object is null or we try to stop task that is not ticking
        if (data == null || typeof data.task_id === undefined || typeof data.spent_time === undefined
            || data.task_id != task.id) {
            data = { 'task_id': task.id };
        }

        return dataProvider.provide("stopTask", data)
                .then((response) => {
                    let result;
                    if (response == ERROR.LogOut) {    // User isn`t logged in
                        result = {msg: 'You were unexpectedly logged out.'};
                    }
                    else if (response == ERROR.TaskStarted) {
                        result = {msg: 'You have to start some task first.'};
                    }
                    else if (response == ERROR.Input) {
                        result = {msg: 'Parameters to stop the task are missing.'};
                    }
                    else if(response.otherTaskStarted) {
                        result = {msg: `You are already working on <strong>${TaskList.getTaskIndexById(response.Id) + 1}. ${response.Name}</strong>`};
                    }
                    else if (response) {                
                        // Update model
                        task.spentTime = response.SpentTime || 0;
                        task.taskStarted = 0;
                        this.clearTickingObjects();

                        Mediator.publish('UpdateModuleItem', 'Counter', false);
                        
                        result = {success: true, msg: '<strong>' + task.name + '</strong> stopped successfully!'};
                    }
                    else {
                        result = {msg: 'Stopping failed!'};
                    }
                    if (this.doRenderTicking) {
                        this.stopCounterTicking(result);
                    }
                });

    }

    clearTickingObjects() {
        // Remove LS object
        LocalStorage.removeItem();
        // Clear window.wtcTicker
        clearInterval(window.wtcTicker);   // Stop ticking
        this.isItemTicking = false;
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