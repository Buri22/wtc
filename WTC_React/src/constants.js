const ERROR = Object.freeze({
    OK: 1,

    Input: 2,
    Email: 3,
    Password: 4,
    EqualPasswords: 5,

    Registered: 10,
    Unregistered: 11,
    Login: 12,
    Logout: 13,
    Brute: 14,

    TaskName: 20,
    TaskSpentTime: 21,
    TaskDateCreated: 22,
    TaskRunning: 23,
    TaskStarted: 24,
    TaskMissing: 25
});
const APP_SETTINGS_OPTIONS = {
    themeColors: [
        { id: 1, name: 'green' },
        { id: 2, name: 'blue' },
        { id: 3, name: 'purple' }
    ],
    sideMenuPositions: [
        { id: 1, name: 'left' },
        { id: 2, name: 'right' }
    ]
};
const DEFAULT_MODULE = 'Counter';
const PAGE_CONTAINER = 'pageContent';
const MODAL_CONTAINER = 'modalContainer';

export { ERROR, APP_SETTINGS_OPTIONS, DEFAULT_MODULE, PAGE_CONTAINER, MODAL_CONTAINER };