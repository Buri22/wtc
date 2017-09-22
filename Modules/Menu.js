/**
 * Created by Uživatel on 22.9.2017.
 */
var Menu = function() {
    var modules = [];
    var $menu, $mainMenu, $account, $logout, $modal;

    // Load View & Cache DOM
    $.get('view/menu.htm', function(template) {
        $menu     = $(template);
        $mainMenu = $menu.find('#main_menu');
        $account  = $menu.find('#account');
        $logout   = $menu.find('#logout');
        $modal    = $menu.find('#account_modal');
    });

    function render() {

    }


};