/**
 * Created by U�ivatel on 22.9.2017.
 */
var Page = function($pageContainer) {
    var $container   = $pageContainer,
		$pageContent = $('<div></div>', { id: 'pageContent' }),
    	$sideMenu    = $('<div></div>', { id: 'sideMenu' });

    function renderPage(appSettings) {
		// Define Page layout
		if (appSettings.sideMenu.active) {
			$sideMenu.empty().addClass('col-md-3');
			$pageContent.empty().addClass('col-md-9');

			if (appSettings.sideMenu.position == 'left') {
				$container.append($sideMenu, $pageContent);
			}
			else if (appSettings.sideMenu.position == 'right') {
				$container.append($pageContent, $sideMenu);
			}

			mediator.publish('PageReadyToImportSideMenuItems', $sideMenu);
			mediator.publish('ActiveSideMenu');
		}
		else {
			$container.append($pageContent.empty());
		}

		// All Moules which want to be in page have to subscribe for "PageReadyToImportModuleItems" event
		mediator.publish('PageReadyToImportModuleItems', $pageContent);
    }

    function addItemToSideMenu(item) {
        $sideMenu.append($(item));
    }
    function removeItemFromSideMenu(selector) {
        $sideMenu.find('#' + selector).remove();
    }

    mediator.subscribe('ReloadPageLayout', renderPage);
    mediator.subscribe('AddItemToSideMenu', addItemToSideMenu);
    mediator.subscribe('RemoveItemFromSideMenu', removeItemFromSideMenu);
    return {
        renderPage: renderPage
    }
};