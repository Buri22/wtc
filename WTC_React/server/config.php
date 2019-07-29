<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);   

/**
 * These are the database login params
 */
if ($_SERVER['SERVER_NAME'] == 'localhost') {
    // Development
    define("HOST", "127.0.0.1");                // The host you want to connect to.
    define("DATABASE", "work_time_counter");    // The database name.
    define("USER", "root");                     // The database username.
    define("PASSWORD", "");                     // The database password.

    define("SECURE", FALSE);                    // FOR DEVELOPMENT ONLY!!!!
}
else {
    //Production
    define("HOST", "127.0.0.1");                // The host you want to connect to.
    define("DATABASE", "buridevelopmentcz3");   // The database name.
    define("USER", "buridevelo1");              // The database username.
    define("PASSWORD", "Kerolajn89");           // The database password.

    define("SECURE", TRUE);                    
}
 

define("CAN_REGISTER", "any");
define("DEFAULT_ROLE", "user");

/**
 * Error types
 */
abstract class WTCError {
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

/**
 * SalesForce API constants
 */
define("USE_SF", true);
define("SF_APP_ID", '3MVG9Ve.2wqUVx_b9M2AAZN7PdAdvR9TsRGJWEMh.UxCBdW.ST77fLadKpzvozsQq9ckixFQBwAjhbTt.ioBV');
define("SF_APP_SECRET", '56F7D9A8A40A5B62AF4F021F0EF0685CA676CEBCE8C18728DFE071E5226616C4');

/**
 * Custom categories edit functions
 * key - array name that contains data for function
 * value - function name
 */
define("CUSTOM_CATEGORIES_EDIT_FUNCTIONS", serialize(array(
    'newCategories' => 'createCategories',
    'categoriesToEdit' => 'editCategories',
    'categoriesToRemove' => 'deleteCategories'
)));
