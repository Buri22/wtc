// Name of localStorage ticking object
const WTC_TICKING_COUNTER = 'wtc_ticking_counter';

const ERROR = Object.freeze({
    OK: 1,
    
    Input: 2,
    Email: 3,
    Password: 4,
    Registered: 5,
    Brute: 5,
    Unregistered: 6,
    EqualPasswords: 6,
    Login: 7,
    Logout: 8,

    TaskName: 9,
    TaskSpentTime: 10,
    TaskDateCreated: 11,
    TaskRunning: 12,
    TaskStarted: 13,
    TaskMissing: 14
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