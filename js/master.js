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
}



























