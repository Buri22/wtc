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
 * These are the Login constants
 */
// Max login attempts in less than last attempt min time
define("MAX_LOGIN_ATTEMPTS", 5);
define("LAST_ATTEMPT_MIN_TIME", (2 * 60 * 60));