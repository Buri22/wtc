import React from 'react';

const APP_CONTEXT = React.createContext({
    themeColor:       1,
    sideMenuIsActive: true,
    sideMenuPosition: 1,
    changeAppSettings: () => {}
});

export { APP_CONTEXT };