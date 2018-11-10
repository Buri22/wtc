import User from '../model/user';

const WTC_TICKING_COUNTER = 'wtc_ticking_counter';

/**
 * Wrapper for localStorage object
 */
class LocalStorage {
    // Creates or updates local storage object
    setItem(task) {
        let storageTickingItem = {
            task_id: task.id,
            spent_time: task.spentTime || 0
        };
        localStorage.setItem(`${WTC_TICKING_COUNTER}-${User.getProp('id')}`, JSON.stringify(storageTickingItem));
    }
    getItem() {
        let LSObject = localStorage.getItem(`${WTC_TICKING_COUNTER}-${User.getProp('id')}`);
        if (LSObject !== null || JSON.parse(LSObject) !== '') {
            return JSON.parse(LSObject);
        }
        return null;
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