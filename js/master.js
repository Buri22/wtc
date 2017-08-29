function run() {

    // Check if user is logged in
    Helper.ajaxCall("checkLogin", "POST", undefined, function(result) {
        if (result){    // User is logged in
            ActionProvider.renderLayout(result);
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



























