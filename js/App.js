/**
 * Created by Uživatel on 18.9.2017.
 */
var App = function() {
    // Initialize Modules
    var account = new Account();
    var menu = new Menu();
    var counter = new Counter();

    var $content = $('#content');
    var $layout, $menu, $pageContent;

    // Load Views & Cache DOM
    $.get('view/layout.html', function(template) {
        $layout      = $(template);
        $menu        = $layout.filter('#menu');
        $pageContent = $layout.filter('#page');

        mediator.publish('AppLayoutLoaded');
    });

    function run() {
        //$content.html(LOADING_GIF);
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
                Helper.bindEnterSubmitEvent(this, '#submit');
            })
            // Clear .modal after close
            .on('hidden.bs.modal', '.modal', function () {
                $(this).empty();
            });
    }

    function renderAppLayout() {
        if (typeof $layout == 'undefined') {
            mediator.subscribe('AppLayoutLoaded', renderAppLayout);
        } else {
            $content.html($layout);

            // Load Menu
            menu.renderMenu($menu);

            // Load page Counter
            counter.renderCounter($pageContent);
        }
    }

    // Subscribe to listen for calls from outside
    mediator.subscribe('RenderAppLayout', renderAppLayout);

    return {
        run: run
    }
};