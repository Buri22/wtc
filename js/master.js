function run() {

    // Check if user is logged in
    Helper.ajaxCall("checkLogin", "POST", undefined, function(result) {
        if (result){    // User is logged in

            $('#content').load('templates/main.html', function() {
                ActionProvider.getTaskList();
            });

        }
        else {          // Go to Login page

            $('#content').load('templates/login.html');

        }
    });

    // Every time a modal is shown, if it has an autofocus attribute, focus on it.
    $(document).on('shown.bs.modal','.modal', function () {
        $(this).find('[autofocus]').focus();
    });

    // Clear .modal after close
    $(document).on('hidden.bs.modal', '.modal', function () {
        $(this).empty();
    })

}



























