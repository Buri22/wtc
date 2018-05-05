/**
 * Initiates the modules and application render
 */
// class App {
//     constructor() {
//         /**
//          * App settings
//          * @type JSON
//          */
//         this.appSettings = null
//         /**
//          * App settings options
//          */
//         this.appOptions = {
//             themeColors: ['green', 'blue', 'purple'],
//             sideMenuPositions: ['left', 'right']
//         }

//         /**
//          * Container for the whole app
//          * @type jQuery object
//          */
//         this.$content  = $('#content')
//         /**
//          * Container for the app menu
//          * @type jQuery object
//          */
//         this.$menu = $('<div></div>', { id: 'menu' })
//         /**
//          * Container for the app page
//          * @type jQuery object
//          */
//         this.$pageContent = $('<div></div>', { id: 'page' })

//         // Initialize Modules
//         this.account = new Account()
//         this.menu    = new Menu()
//         this.page    = new Page(this.$pageContent)
//         this.counter = new Counter([new Tasks()])

//         // Subscribe to listen for calls from outside
//         mediator.subscribe('UserLogin', this.renderAppLayout)
//     }

//     /**
//      * Initial function
//      */
//     run() {
//         // Check if user is logged in
//        DataProvider.provide('checkLogin').done(function(result) {
//            if (result){
//                // Define user model
//                // TODO: account is here undefined... why?
//                account.setUser(result);
//                appSettings = account.getUserAppSettings();
//
//                renderAppLayout();
//            }
//            else {
//                account.renderLogin();
//            }
//        });
//
//         $(document)
//             // Every time a modal is shown, if it has an autofocus attribute, focus on it.
//             .on('shown.bs.modal','.modal', function () {
//                 $(this).find('[autofocus]').focus();
//                 Helper.bindKeyShortcutEvent(this, '.submit_btn:visible');
//             })
//             // Clear .modal after close
//             .on('hidden.bs.modal', '.modal', function () {
//                 $(this).empty();
//             });

//         // Extend usage of localStorage to hold JS objects in JSON
//         Storage.prototype.setObject = function(key, value) {
//             this.setItem(key, JSON.stringify(value));
//         };
//         Storage.prototype.getObject = function(key) {
//             return this.getItem(key) && JSON.parse(value);
//         };
//     }

//     renderAppLayout() {
//         this.$content.empty().append(this.$menu, this.$pageContent);

//         // Load Menu
//         this.menu.renderMenu(this.$menu);

//         // Load page layout
//         this.page.renderPage(this.appSettings);

//     }

//     getLoggedUserId() {
//         return this.account.getUserId();
//     }
//     getAppOptions() {
//         return this.appOptions;
//     }
// }

var App = function() {
    var appSettings,
        $content     = $('#content'),
        $menu        = $('<div></div>', { id: 'menu' }),
        $pageContent = $('<div></div>', { id: 'page' }),
        appOptions   = APP_SETTINGS_OPTIONS;

    // Initialize Modules
    var account = new Account();
    var menu    = new Menu();
    var page    = new Page($pageContent);
    var counter = new Counter([new Tasks()]);

    function run() {
        // Check if user is logged in
        DataProvider.provide('checkLogin').done(function(result) {
            if (result){
                // Define user model
                account.setUser(result);
				appSettings = account.getUserAppSettings();

                renderAppLayout();
            }
            else {
                account.renderLogin();
            }
        });

        $(document)
            // Every time a modal is shown, if it has an autofocus attribute, focus on it.
            .on('shown.bs.modal','.modal', function () {
                $(this).find('[autofocus]').focus();
                Helper.bindKeyShortcutEvent(this, '.submit_btn:visible');
            })
            // Clear .modal after close
            .on('hidden.bs.modal', '.modal', function () {
                $(this).empty();
            });

        // Extend usage of localStorage to hold JS objects in JSON
        Storage.prototype.setObject = function(key, value) {
            this.setItem(key, JSON.stringify(value));
        };
        Storage.prototype.getObject = function(key) {
            var value = this.getItem(key);
            return value && JSON.parse(value);
        };
    }

    function renderAppLayout() {
        $content.empty().append($menu, $pageContent);

		// Load Menu
		menu.renderMenu($menu);

		// Load page layout
		page.renderPage(appSettings);

    }

    function getLoggedUserId() {
        return account.getUserId();
    }
    function getAppOptions() {
        return appOptions;
    }

    // Subscribe to listen for calls from outside
    mediator.subscribe('UserLogin', renderAppLayout);

    return {
        run: run,
        getLoggedUserId: getLoggedUserId,
        getAppOptions: getAppOptions
    }
};