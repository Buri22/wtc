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

// Check if user is logged in
function checkLogin() {
    // Check if all session variables are set
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_string'])) {
        return false;
    }
    // Try to get user from db
    $user =  Db::queryOne('
              SELECT Id, UserName, Password
              FROM user
              WHERE Id = ?
            ', $_SESSION['user_id']);
    if (!$user) {    // User has no record in DB
        return false;
    }
    // Check if login_string stored in session equals to login_check
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

    $result['Id'] = $user['Id'];
    $result['UserName'] = $user['UserName'];

    return $result;
}