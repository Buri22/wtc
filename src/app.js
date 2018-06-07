import $ from 'jquery';
import 'bootstrap';
import 'bootstrap-datepicker';

import {mediator} from './mediator';
import {dataProvider} from './dataProvider';

import Helper from './helper';
import Menu from './modules/Menu';
import Page from './modules/Page';
import Account from './modules/Account';
import Counter from './modules/Counter';

/**
 * Initiates the modules and application render
 */
class App {
    constructor() {
        /**
         * Container for the whole app
         * @type jQuery object
         */
        this.$content  = $('#content')
        /**
         * Container for the app menu
         * @type jQuery object
         */
        this.$menu = $('<div></div>', { id: 'menu' })
        /**
         * Container for the app page
         * @type jQuery object
         */
        this.$pageContent = $('<div></div>', { id: 'page' })

        // Initialize Modules
        this.account = new Account()
        this.menu    = new Menu()
        this.page    = new Page(this.$pageContent)
        this.counter = new Counter()

        // Subscribe to listen for calls from outside
        mediator.subscribe('UserLogin', this.renderAppLayout.bind(this))
    }

    /**
     * Initial function
     */
    run() {
        // Check if user is logged in
        dataProvider.provide('checkLogin').done((result) => {
            if (result){
                // Define user model
                // TODO: refactor this code to use new User model
                this.account.setUser(result);
                //this.appSettings = this.account.getUserAppSettings();

                this.renderAppLayout();
            }
            else {
                this.account.renderLogin();
            }
        });

        $(document)
            // Every time a modal is shown, if it has an autofocus attribute, focus on it.
            .on('shown.bs.modal','.modal', function() {
                $(this).find('[autofocus]').focus();
                Helper.bindKeyShortcutEvent(this, '.submit_btn:visible');
            })
            // Clear .modal after close
            .on('hidden.bs.modal', '.modal', function() {
                $(this).empty();
            });

        // Extend usage of localStorage to hold JS objects in JSON
        Storage.prototype.setObject = function(key, value) {
            this.setItem(key, JSON.stringify(value));
        };
        Storage.prototype.getObject = function(key) {
            return this.getItem(key) && JSON.parse(this.getItem(key));
        };
    }

    renderAppLayout() {
        this.$content.empty().append(this.$menu, this.$pageContent);

        // Load Menu
        this.menu.renderMenu(this.$menu);

        // Load page layout
        this.page.renderPage(this.account.user.appSettings);

    }
}

// Initialize application object
var app = new App();
app.run();