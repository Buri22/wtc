// Name of localStorage ticking object
const WTC_TICKING_COUNTER = 'wtc_ticking_counter';

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

const DATEPICKER_OPTIONS = {
    todayBtn: true,
    todayHighlight: true,
    autoclose: true,
    format: 'dd.mm.yyyy'
};

const APP_SETTINGS_OPTIONS = {
    themeColors: ['green', 'blue', 'purple'],
    sideMenuPositions: ['left', 'right']
};

export {WTC_TICKING_COUNTER, ERROR, DATEPICKER_OPTIONS, APP_SETTINGS_OPTIONS};