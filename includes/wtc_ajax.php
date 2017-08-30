<?php
/*
 * Name: - Work Time Counter -
 * Author: Buri22
 * Date: 2017/8/10 19:08
 * Version: 1.0.0
 */
require_once 'Db_connect.php';
require_once 'functions.php';

$ajax_actions = array(
    "GET_TASK_LIST"      => "getTaskList",
    "GET_TASK_BY_ID"     => "getTaskById",
    "START_TASK"         => "startTask",
    "STOP_TASK"          => "stopTask",
    "CREATE_TASK"        => "createTask",
    "EDIT_TASK"          => "editTask",
    "DELETE_TASK"        => "deleteTask",
    "LOGIN"              => "login",
    "CHECK_LOGIN"        => "checkLogin",
    "LOGOUT"             => "logout",
    "REGISTER"           => "register"
);

$headers = getallheaders();
$action = $headers["Ajax-Action"];

if (is_ajax($headers) && $action != null) {
    switch ($action) {
        case ($ajax_actions["CHECK_LOGIN"]):
            echo json_encode(checkLogin());
            break;

        case ($ajax_actions["REGISTER"]):
            echo json_encode(register());
            break;

        case ($ajax_actions["LOGIN"]):
            echo json_encode(login());
            break;

        case ($ajax_actions['LOGOUT']):
            echo json_encode(logout());
            break;

        case $ajax_actions["GET_TASK_BY_ID"]:
            echo json_encode(getTask());
            break;

        case ($ajax_actions["GET_TASK_LIST"]):
            echo json_encode(getTaskList());
            break;

        case ($ajax_actions["CREATE_TASK"]):
            echo json_encode(createTask());
            break;

        case ($ajax_actions["EDIT_TASK"]):
            echo json_encode(editTask());
            break;

        case ($ajax_actions["DELETE_TASK"]):
            echo json_encode(deleteTask());
            break;

        case ($ajax_actions["START_TASK"]):
            echo json_encode(startCounting());
            break;

        case ($ajax_actions["STOP_TASK"]):
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