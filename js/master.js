function run() {

    // Check if user is logged in
    if (!docCookies.getItem(wtc_login)){  // Go to Login page

        $('#content').load('templates/login.html');

    }
    else {    // User is logged in

        $('#content').load('templates/main.html', function() {
            ActionProvider.getTaskList();
        });

    }
}



























