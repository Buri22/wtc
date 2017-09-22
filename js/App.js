/**
 * Created by Uživatel on 18.9.2017.
 */
var App = function() {
    // Initialize Modules
    var account = new Account();
    var counter = new Counter();

    var $content = $('#content');
    var $layout, $menu, $pageContent;

    // Load Views & Cache DOM
    $.get('view/layout.html', function(template) {
        $layout      = $(template);
        $menu        = $layout.filter('#menu');
        $pageContent = $layout.filter('#page');
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
                Helper.bindEnterSubmitEvent(this, '#submit');
            })
            // Clear .modal after close
            .on('hidden.bs.modal', '.modal', function () {
                $(this).empty();
            });
    }

    function renderAppLayout() {
        $content.html($layout);
        // Load Menu
        $.get('view/menu.htm', function(template) {
            $('#menu').append(
                Mustache.render($(template).html(), { userName: account.getUserName() })
            )
        });
        // Load page Counter
        counter.render($pageContent);
    }


    return {
        run: run
    }
};