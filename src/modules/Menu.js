import {mediator} from '../mediator';

/**
 * WTC core module that renders menu + all modules that want to be in the menu
 */
// var Menu = function() {
//     //var modules = [];
//     var $menu, $mainMenu;

//     // Load View & Cache DOM
//     $.get('view/menu.htm', function(template) {
//         $menu = $(template);
//         $mainMenu = $menu.find('#main_menu');

//         mediator.publish('MenuLoaded');
//     });

//     function renderMenu($container) {
//         if (typeof $menu == 'undefined') {
//             mediator.subscribe('MenuLoaded', renderMenu, $container);
//         } else {
//             $mainMenu.empty();
//             $($container).html($menu);

//             // All Moules which want to be in menu have to subscribe for "MenuReadyToImportModuleItems" event
//             mediator.publish('MenuReadyToImportModuleItems', $mainMenu);
//         }
//     }

//     return {
//         renderMenu: renderMenu
//     }
// };

export default class Menu {
    constructor() {
        this.$menu, this.$mainMenu;

        // Load View & Cache DOM
        $.get('view/menu.htm', (template) => {
            this.$menu = $(template);
            this.$mainMenu = this.$menu.find('#main_menu');

            mediator.publish('MenuLoaded');
        });
    }

    renderMenu($container) {
        if (typeof this.$menu == 'undefined') {
            mediator.subscribe('MenuLoaded', this.renderMenu, $container);
        } else {
            this.$mainMenu.empty();
            $($container).html(this.$menu);

            // All Moules which want to be in menu have to subscribe for "MenuReadyToImportModuleItems" event
            mediator.publish('MenuReadyToImportModuleItems', this.$mainMenu);
        }
    }
}