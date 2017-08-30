<?php
include_once 'config.php';

function sec_session_start() {
    $session_name = 'sec_session_id';   // Set a custom session name
    $secure = SECURE;
    // This stops JavaScript being able to access the session id.
    $httponly = true;
    // Forces sessions to only use cookies.
    if (ini_set('session.use_only_cookies', 1) === FALSE) {
        // TODO: relocate by JS
        header("Location: ../error.php?err=Could not initiate a safe session (ini_set)");
        exit();
    }
    // Gets current cookies params.
    $cookieParams = session_get_cookie_params();
    session_set_cookie_params($cookieParams["lifetime"], $cookieParams["path"], $cookieParams["domain"], $secure, $httponly);
    // Sets the session name to the one set above.
    session_name($session_name);
    session_start();            // Start the PHP session
    session_regenerate_id();    // regenerated the session, delete the old one.
}

function check_brute($user) {
    $now = time();  // Get timestamp of current time
    $login_attempts = $user['LoginAttempts'] + 1;
    $last_attempt = $user['LastAttempt'] == null ? $now : $user['LastAttempt'];
    $result = false;

    if ($login_attempts > MAX_LOGIN_ATTEMPTS) { // This is the MAX_LOGIN_ATTEMPTS + 1 attempt to login
        if ($now - $last_attempt < LAST_ATTEMPT_MIN_TIME) { // Block the account
            $result = true;
        }
        else {
            --$login_attempts;
        }
    }

    // Update users LoginAttempts and LastAttempt
    Db::query('
        UPDATE user
        SET LoginAttempts = ?, LastAttempt = ?
        WHERE Id = ?
    ', $login_attempts, $now, $user['Id']);

    return $result;
}

// Check if user is logged in and return User for JS manipulation
function checkLogin() {
    sec_session_start();
    // Check if all session variables are set
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_string'])) {
        return false;
    }
    // Try to get user from db
    $user =  Db::queryOne('
              SELECT Id, UserName, Password, Email
              FROM user
              WHERE Id = ?
            ', $_SESSION['user_id']);
    if (!$user) {    // User has no record in DB
        return false;
    }
    // Check if login_string stored in session equals to $login_check
    $login_check = hash('sha512', $user['Password'] . $_SERVER['HTTP_USER_AGENT']);
    if (!hash_equals($login_check, $_SESSION['login_string'])) {
        return false;
    }

    return getUserForJS($user);
}

// Check if some task started
function checkTaskStarted() {
    $user = checkLogin();

    if ($user) {
        $task = Db::queryOne('
                  SELECT *
                  FROM task
                  WHERE TaskStarted = 1 AND UserId = ?
                ', $user['Id']);
        return $task;   // returns task that started or false
    }
    else {
        return 'logOut';
    }
}

// Define User object form JS manipulation
function getUserForJS($user) {
    $result = [];

    $result['Id']       = $user['Id'];
    $result['UserName'] = $user['UserName'];
    $result['Email']    = $user['Email'];

    return $result;
}

function register() {
    // Check if all inputs were entered
    if (!isset($_POST['user_name']) || empty($_POST['user_name'])
        || !isset($_POST['email']) || empty($_POST['email'])
        || !isset($_POST['password']) || empty($_POST['password'])
        || !isset($_POST['password_confirm']) || empty($_POST['password_confirm'])
    ) { return 2; }

    // Email validation
    if (!isValidEmail(trim($_POST['email']))) { return 3; }

    // Password == Password_confirm
    if (trim($_POST['password']) != trim($_POST['password_confirm'])) { return 4; }

    // Check if user is already registered
    $registered = Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', $_POST['email']);

    if ($registered) { return 5; }

    $password = password_hash(trim($_POST['password']), PASSWORD_BCRYPT);
    $new_user = Db::query('
                                INSERT INTO user (UserName, Password, Email)
                                VALUES (?, ?, ?)
                            ', trim($_POST['user_name']), $password, trim($_POST['email']));
    return $new_user;
}

function login() {
    sec_session_start();    // Our custom secure way of starting a PHP session.

    // Check if all inputs were entered
    if (!isset($_POST['email']) || empty($_POST['email'])
        || !isset($_POST['password']) || empty($_POST['password'])) {
        return 2;
    }
    // Email validation
    if (!isValidEmail(trim($_POST['email']))) {
        return 3;
    }
    // Try to find user
    $user =  Db::queryOne('
                          SELECT *
                          FROM user
                          WHERE Email = ?
                    ', trim($_POST['email']));

    if (!$user) {    // User has no record in DB
        return 4;
    }
    else if (check_brute($user)){
        return 5;
    }
    else if (!password_verify($_POST['password'], $user['Password'])) {   // Check passwords
        return 6;
    }

    $_SESSION['user_id'] = $user['Id'];
    $_SESSION['login_string'] = hash('sha512', $user['Password'] . $_SERVER['HTTP_USER_AGENT']);
    return $user;
}

function logout() {
    sec_session_start();

    // Unset all session values
    $_SESSION = array();

    // get session parameters
    $params = session_get_cookie_params();

    // Delete the actual cookie.
    setcookie(session_name(),
        '', time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]);

    // Destroy session
    session_destroy();

    return true;
}

function getTask() {
    if (!isset($_POST['task_id']) || empty($_POST['task_id'])) {
        return 2;
    }
    $result = Db::queryOne('
                    SELECT *
                    FROM task
                    WHERE Id = ?
                ', intval($_POST['task_id']));
    return $result;
}

// Get list of tasks
function getTaskList() {
    $user = checkLogin();
    if ($user) {
        $result = Db::queryAll('
                        SELECT Id, Name
                        FROM task
                        WHERE UserId = ?
                        ORDER BY Id DESC
                    ', $user['Id']);

        return $result;
    }
    else return $user;
}

function createTask() {
    if (!isset($_POST['new_task_name']) || empty($_POST['new_task_name'])) {
        return 2;
    }
    $user = checkLogin();
    if (!$user) { return 3; }

    // Check if task name already exists
    $result = Db::query('
                    SELECT *
                    FROM task
                    WHERE UserId = ? AND Name = ?
                ', $user['Id'], $_POST['new_task_name']);
    if ($result) { return 4; }

    $newTask = Db::query('
                        INSERT INTO task (Name, DateCreated, UserId)
                        VALUES (?, ?, ?)
                    ', $_POST['new_task_name'], date("Y-m-d H:i:s"), $user['Id']);
    return $newTask;
}

function editTask() {
    // Check if all inputs were entered
    if (!isset($_POST['new_task_name']) || empty($_POST['new_task_name'])
        || !isset($_POST['task_id']) || empty($_POST['task_id'])) {
        return 2;
    }
    $user = checkLogin();
    if (!$user) { return 3; }

    // Check if task name already exists
    $result = Db::queryOne('
                    SELECT *
                    FROM task
                    WHERE Name = ? AND UserId = ?
                ', $_POST['new_task_name'], $user['Id']);

    // This task name does not exist or is not exactly the same as edited
    if (!$result || ($result && $result['Name'] !== $_POST['new_task_name'])) {
        $editedTask = Db::query('
                            UPDATE task
                            SET Name = ?
                            WHERE Id = ?
                        ', $_POST['new_task_name'], $_POST['task_id']);
        return $editedTask;
    }
    else {
        return 4;
    }
}

function deleteTask() {
    // Check if all inputs were entered
    if (!isset($_POST['password']) || empty($_POST['password'])
        || !isset($_POST['task_id']) || empty($_POST['task_id'])
    ) { return 2; }

    // Try to find the task
    $password = Db::queryOne('
                        SELECT Password
                        FROM user
                        LEFT JOIN task ON task.UserId = user.Id
                        WHERE task.Id = ?
                    ', $_POST['task_id']);
    if (!$password) {
        return 3;
    }
    else if(!password_verify($_POST['password'], $password['Password'])) {
        return 4;
    }

    $result = Db::queryOne('
                    DELETE FROM task
                    WHERE Id = ?
                  ', $_POST['task_id']);
    return $result;
}

// Start counting and return started task values
function startCounting() {
    $task_started = checkTaskStarted();

    if ($task_started == 'logOut') {
        return $task_started;
    }
    else if ($task_started) {
        $task_started['someTaskAlreadyStarted'] = true;
        return $task_started;    // We`re sending task that already started
    }

    if (!isset($_POST['task_id']) || empty($_POST['task_id'])
        || !isset($_POST['last_start']) || empty($_POST['last_start'])
    ) { return 2; }

    $result = Db::query('
                     UPDATE task
                     SET LastStart = ?, TaskStarted = true
                     WHERE Id = ?
                 ', intval($_POST["last_start"]), intval($_POST['task_id']));
    if ($result) {
        $work = Db::queryOne('
                        SELECT Id, SpentTime
                        FROM task
                        WHERE Id = ?
                    ', intval($_POST['task_id']));

        return $work;
    }
    else return $result;
}

function stopCounting() {
    $task_started = checkTaskStarted();

    if ($task_started == 'logOut') {
        return $task_started;
    }
    else if (!$task_started) {
        return 'noTaskStarted';
    }

    if (!isset($_POST['task_id']) || empty($_POST['task_id'])) {
        return 2;
    }

    if ($_POST['task_id'] != $task_started['Id']) { // Other task started
        $task_started['otherTaskStarted'] = true;
        return $task_started;
    }

    $spent_time = time() - $task_started['LastStart'] + $task_started['SpentTime'];
    $result = Db::query('
                    UPDATE task
                    SET SpentTime = ?, TaskStarted = false
                    WHERE Id = ?
                  ', $spent_time, intval($_POST['task_id']));

    return $result;
}


















