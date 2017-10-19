<?php
/*
 * Name: - Work Time Counter -
 * Author: Buri22
 * Date: 2017/8/10 19:08
 * Version: 1.0.0
 */
require_once 'Db_connect.php';
require_once 'functions.php';

$headers = getallheaders();
$action = $headers["Ajax-Action"];

if (is_ajax($headers) && $action != null) {
    switch ($action) {
        case "checkLogin":
            echo json_encode(checkLogin());
            break;

        case "register":
            echo json_encode(register());
            break;

        case "login":
            echo json_encode(login());
            break;

        case "logout":
            echo json_encode(logout());
            break;

        case "editAccount":
            echo json_encode(editAccount());
            break;

//        case "getTaskById":
//            echo json_encode(getTask());
//            break;

        case "getTaskList":
            echo json_encode(getTaskList());
            break;

        case "createTask":
            echo json_encode(createTask());
            break;

        case "editTask":
            echo json_encode(editTask());
            break;

        case "deleteTask":
            echo json_encode(deleteTask());
            break;

        case "startTask":
            echo json_encode(startCounting());
            break;

        case "stopTask":
            echo json_encode(stopCounting());
            break;

        default:
            echo json_encode("Unknown action used.");
    }
} else {
    echo json_encode($headers);
}

// Check if the request is an AJAX request
function is_ajax($headers) {
    return isset($headers['X-Requested-With']) && strtolower($headers['X-Requested-With']) == 'xmlhttprequest';
}

// Validate email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL)
            && preg_match('/[0-9A-z]+@[A-z]+\.[A-z]+/', $email);
}