<?php

/* |---------------------------------|
 * |            Functions            |
 * |---------------------------------|
 * */

function startCounting($current_work_id) {
    // check if any work already started
    $works = Db::queryOne('
                  SELECT *
                  FROM work
                  WHERE work_started = 1
              ');
    if (!$works) {  // No work started

        $current_start_time = time();

        ?>
        <script>
            showTime("<?php $works['id'] ?>");
        </script>
        <?php
        
        $result = Db::query('
                     UPDATE work
                     SET last_start = ?, work_started = true
                     WHERE id = ?
                     ', $current_start_time, $current_work_id);
        if ($result) {
            $start_counting_result = 'Started successfully!';
        } else {
            $start_counting_result = 'Failed to start this task.';
        }
    } else {
        $start_counting_result = 'You are already working on: ' . $works['name'];
    }

    return $start_counting_result;
}

function stopCounting($current_work_id) {

    if (checkWork($current_work_id, "work_started")) {
        $current_work = checkWork($current_work_id, "whole");

        if ($current_work) {

            $spent_time = $current_work['spent_time'] + (time() - $current_work['last_start']);

            $result = Db::query('
                        UPDATE work
                        SET spent_time = ?, work_started = false
                        WHERE id = ?
                        ', $spent_time, $current_work_id);
            if ($result) {
                $stop_counting_result = $current_work['name'] . ' stopped successfully!';
            } else {
                $stop_counting_result = 'Failed to stop this task.';
            }
        } else {
            $stop_counting_result = 'Current work name is not in database.';
        }
    } else {
        $stop_counting_result = 'You have to start the work first!';
    }

    return $stop_counting_result;
}

function checkWork($id, $param) {
    $work = Db::queryOne('
            SELECT *
            FROM work
            WHERE id = ?
            ', $id);

    //var_dump($work);
    if ($work) {
        if ($param == "whole") {
            return $work;
        }
//        else if ($param == "name") {
//
//        }
//        else if ($param == "last_start") {
//
//        }
        else if ($param == "spent_time") {
            if (!$work) {
                return $work = 'I can`t find current spent time.';
            } else {
                //var_dump($work["spent_time"]);
                return $work["spent_time"];
            }
        }
        else if ($param == "work_started") {
            if ($work['work_started'] == 1) {
                return true;
            } else {
                return false;
            }
        }
    }
    else {
        echo "There`s not such a work in our database ;)";
        return false;
    }
    return false;
}
