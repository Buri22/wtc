/**
 * WTC core module that renders menu + all modules that want to be in the menu
 */
var Menu = function() {
    //var modules = [];
    var $menu, $mainMenu;

    // Load View & Cache DOM
    $.get('view/menu.htm', function(template) {
        $menu = $(template);
        $mainMenu = $menu.find('#main_menu');

        mediator.publish('MenuLoaded');
    });

    function renderMenu($container) {
        if (typeof $menu == 'undefined') {
            mediator.subscribe('MenuLoaded', renderMenu, $container);
        } else {
            $mainMenu.empty();
            $($container).html($menu);

            // All Moules which want to be in menu have to subscribe for "MenuReadyToImportModuleItems" event
            mediator.publish('MenuReadyToImportModuleItems', $mainMenu);
        }
    }

    return {
        renderMenu: renderMenu
    }
};