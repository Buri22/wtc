/**
 * Created by Uživatel on 22.9.2017.
 */
var Page = function() {
    var $page, $sideMenu, $pageContent;

    // Load View & Cache DOM
    $.get('view/page.html', function(template) {
        $page        = $(template);
        $sideMenu    = $page.filter('#sideMenu');
        $pageContent = $page.filter('#pageContent');

        mediator.publish('PageLoaded');
    });

    function renderPage($container) {
        if (typeof $page == 'undefined') {
            mediator.subscribe('PageLoaded', renderPage, $container);
        } else {
            // TODO: App setting will able to switch sideMenu from left to right or no sideMenu
            // Define Page layout
            $sideMenu.empty().addClass('col-md-3');
            $pageContent.empty().addClass('col-md-9');
            $($container).html($page);

            // All Moules which want to be in page have to subscribe for "PageReadyToImportModuleItems" event
            mediator.publish('PageReadyToImportSideMenuItems', $sideMenu);
            mediator.publish('PageReadyToImportModuleItems', $pageContent);
            mediator.publish('ActiveSideMenu');
        }
    }

    function addItemToSideMenu(item) {
        $sideMenu.append($(item));
    }
    function removeItemFromSideMenu(selector) {
        $sideMenu.find('#' + selector).remove();
    }

    mediator.subscribe('AddItemToSideMenu', addItemToSideMenu);
    mediator.subscribe('RemoveItemFromSideMenu', removeItemFromSideMenu);
    return {
        renderPage: renderPage
    }
};