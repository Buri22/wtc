import $ from 'jquery';

import {mediator} from '../mediator';

/**
 * WTC core module that renders page layout based on appSettings + the default module page
 */
export default class Page {
	constructor($pageContainer) {
		this.$container   = $pageContainer;
		this.$pageContent = $('<div></div>', { id: 'pageContent' });
		this.$sideMenu    = $('<div></div>', { id: 'sideMenu' });

		mediator.subscribe('ReloadPageLayout', this.renderPage.bind(this));
		mediator.subscribe('AddItemToSideMenu', this.addItemToSideMenu.bind(this));
		mediator.subscribe('RemoveItemFromSideMenu', this.removeItemFromSideMenu.bind(this));
	}

	renderPage(appSettings) {
    	// TODO: implement change of theme color
		// Define Page layout
		if (appSettings.sideMenu.active) {
			this.$sideMenu.empty().addClass('col-md-3');
			this.$pageContent.empty().addClass('col-md-9');

			if (appSettings.sideMenu.position == 'left') {
				this.$container.append(this.$sideMenu, this.$pageContent);
			}
			else if (appSettings.sideMenu.position == 'right') {
				this.$container.append(this.$pageContent, this.$sideMenu);
			}

			mediator.publish('PageReadyToImportSideMenuItems', this.$sideMenu);
			mediator.publish('ActiveSideMenu');
		}
		else {
			$container.append(this.$pageContent.empty());
		}

		// All Moules which want to be in page have to subscribe for "PageReadyToImportModuleItems" event
		mediator.publish('PageReadyToImportModuleItems', this.$pageContent);
    }

    addItemToSideMenu(item) {
        this.$sideMenu.append($(item));
    }
    removeItemFromSideMenu(selector) {
        this.$sideMenu.find('#' + selector).remove();
    }
}