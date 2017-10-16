/**
 * Created by Uživatel on 18.9.2017.
 */
var App = function() {
    // Initialize Modules
    var account = new Account();
    var menu = new Menu();
    var page = new Page();
    var counter = new Counter([new Tasks()]);

    var $content = $('#content');
    var $layout, $menu, $pageContent;

    // Load Views & Cache DOM
    $.get('view/layout.html', function(template) {
        $layout      = $(template);
        $menu        = $layout.filter('#menu');
        $pageContent = $layout.filter('#page');

        mediator.publish('AppLayoutLoaded');
        //bindEventsForMenuItems();
    });

    function run() {
        // Check if user is logged in
        Helper.ajaxCall("checkLogin", "POST", undefined, function(result) {
            if (result){
                // Define user model
                account.setUser(result);

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
                Helper.bindKeyShortcutEvent(this, '#submit_btn');
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
        if (typeof $layout == 'undefined') {
            mediator.subscribe('AppLayoutLoaded', renderAppLayout);
        } else {
            $content.html($layout);

            // Load Menu
            menu.renderMenu($menu);

            // Load page layout
            page.renderPage($pageContent);
        }
    }

    function getLoggedUserId() {
        return account.getUserId();
    }

    // Subscribe to listen for calls from outside
    mediator.subscribe('UserLogin', renderAppLayout);

    return {
        run: run,
        getLoggedUserId: getLoggedUserId
    }
};