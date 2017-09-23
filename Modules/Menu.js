/**
 * Created by Uživatel on 22.9.2017.
 */
var Menu = function() {
    //var modules = [];
    var $menu;

    // Load View & Cache DOM
    $.get('view/menu.htm', function(template) {
        $menu = $(template);

        mediator.publish('MenuLoaded');
    });

    function renderMenu($container) {
        if (typeof $menu == 'undefined') {
            mediator.subscribe('MenuLoaded', renderMenu, $container);
        } else {
            $container.html($menu);

            // Kazdy modul ma svuj $menuItem, ktery pak importne do menu ktore bude pripravene
            mediator.publish('MenuReadyToImportModuleItems');
        }
    }

    return {
        renderMenu: renderMenu
    }
};