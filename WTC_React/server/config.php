<?php
/**
 * These are the database login details
 */
define("HOST", "127.0.0.1");                // The host you want to connect to.
define("DATABASE", "work_time_counter");    // The database name.
define("USER", "root");                 // The database username.
define("PASSWORD", "");   // The database password.

define("CAN_REGISTER", "any");
define("DEFAULT_ROLE", "user");

define("SECURE", FALSE);    // FOR DEVELOPMENT ONLY!!!!

/**
 * Error types
 */
abstract class Error {
    const Input          = 2;
    const Email          = 3;
    const Password       = 4;
    const EqualPasswords = 5;

    const Registered   = 10;
    const Unregistered = 11;
    const Login        = 12;
    const Logout       = 13;
    const Brute        = 14;

    const TaskName        = 20;
    const TaskSpentTime   = 21;
    const TaskDateCreated = 22;
    const TaskRunning     = 23;
    const TaskStarted     = 24;
    const TaskMissing     = 25;
}

/**
 * Login constants
 */
// Max login attempts in less than last attempt min time
define("MAX_LOGIN_ATTEMPTS", 5);
define("LAST_ATTEMPT_MIN_TIME", (2 * 60 * 60));

/**
 * App constants
 */
define("DEFAULT_APP_SETTINGS", serialize(
    array('theme' => array(
            'color' => 'green'
        ),
        'sideMenu' => array(
            'active' => true,
            'position' => 'left'
        )
    )
));


