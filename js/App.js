/**
 * Created by U�ivatel on 18.9.2017.
 */
var App = function() {
    var appSettings,
        $content     = $('#content'),
        $menu        = $('<div></div>', { id: 'menu' }),
        $pageContent = $('<div></div>', { id: 'page' });
    var appOptions = {
        themeColors: ['green', 'blue', 'purple'],
        sideMenuPositions: ['left', 'right']
    };

    // Initialize Modules
    var account = new Account();
    var menu    = new Menu();
    var page    = new Page($pageContent);
    var counter = new Counter([new Tasks()]);

    function run() {
        // Check if user is logged in
        Helper.ajaxCall("checkLogin", "POST", undefined, function(result) {
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
        $content.append($menu, $pageContent);

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