import User from '../model/user';

const WTC_TICKING_COUNTER = 'wtc_ticking_counter';

        // Extend usage of localStorage to hold JS objects in JSON
        Storage.prototype.setObject = function(key, value) {
            this.setItem(key, JSON.stringify(value));
        };
        Storage.prototype.getObject = function(key) {
            return this.getItem(key) && JSON.parse(this.getItem(key));
        };
/**
 * Wrapper for localStorage object
 */
class LocalStorage {
    // Creates or updates local storage object
    setItem(task, storageSpentTime = null) {
        let storageTickingItem = {
            task_id: task.id,
            spent_time: storageSpentTime || task.spentTime || 0
        };
        localStorage.setObject(`${WTC_TICKING_COUNTER}-${User.getProp('id')}`, storageTickingItem);
    }
    getItem() {
        return localStorage.getObject(`${WTC_TICKING_COUNTER}-${User.getProp('id')}`);
    }
    removeItem() {
        let itemKey = `${WTC_TICKING_COUNTER}-${User.getProp('id')}`;
        if (localStorage.getItem(itemKey) != null) { 
            localStorage.removeItem(itemKey);
            return true;
        }
        return false;
    }
}

let localStorageInstance = new LocalStorage();

// Public methods exposed through localStorageProxy
const localStorageProxy = {
    setItem:    localStorageInstance.setItem.bind(localStorageInstance),
    getItem:    localStorageInstance.getItem.bind(localStorageInstance),
    removeItem: localStorageInstance.removeItem.bind(localStorageInstance)
};

export default localStorageProxy;