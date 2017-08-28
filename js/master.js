function run() {

    // Check if user is logged in
    Helper.ajaxCall("checkLogin", "POST", undefined, function(result) {
        if (result){    // User is logged in

            $('#content').load('view/layout.html', function() {
                $.get('view/menu.htm', function(template) {
                    $('#menu').append(
                        Mustache.render($(template).html(), { userName: result.UserName })
                    )
                });

                $('#page').load('view/counter.htm', function() {
                    ActionProvider.getTaskList();
                });

            });
        }
        else {  // Go to Login page

            $('#content').load('view/login.html');

        }
    });

    $(document)
        // Every time a modal is shown, if it has an autofocus attribute, focus on it.
        .on('shown.bs.modal','.modal', function () {
            $(this).find('[autofocus]').focus();
        })
        // Clear .modal after close
        .on('hidden.bs.modal', '.modal', function () {
            $(this).empty();
        });

}



























