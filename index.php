<!DOCTYPE html>
<?php
/*
 * Name: - Work Time Counter -
 * Author: Buri22
 * Date: 2017/8/10 19:08
 * Version: 1.0.0
 */

require_once 'work_time_counter_functions.php';
require_once 'Db.php';
Db::connect('127.0.0.1', 'work_time_counter', 'root', 'Bluegrass');

$create_result = ' ';
$selected_work = $_POST['work_setlist'];
$works = Db::queryAll('
                        SELECT *
                        FROM work
                        ORDER BY id DESC
                    ');
?>

<html lang="cs-cz">
<head>
    <meta charset="UTF-8"/>
    <title>Work Time Counter</title>
    <link href="css/styles.css" rel="stylesheet" type="text/css"/>

    <!-- Bootstrap CSS files -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"
          integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7"
          crossorigin="anonymous">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css">

    <!-- Fonts -->
    <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&subset=latin,latin-ext' type='text/css'>

    <!-- JavaScript files -->
    <script type="text/javascript" src="js/master.js"></script>
</head>
<body>
<div class="container">
    <div class="row"> <!-- Nadpis-->
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <h1 class="text-center">Work Time Counter</h1>
        </div>
    </div>

    <form method="POST">
        <div class="row"> <!-- Select Work Name-->
            <h2 class="text-center">Current work name: </h2>
            <div class="col-xs-12 col-sm-12 col-md-4 col-md-offset-4 col-lg-4 col-lg-offset-4">
                <select name="work_setlist" id="work_setlist_id" class="form-control"
                        onchange="showTime(this.value)">
                    <?php
                    // Start/Stop working
                    foreach ($works as $work) {
                        if ($work['id'] == $selected_work) {
                            $selected = 'selected';
                        } else {
                            $selected = '';
                        }
                        echo '<option value="' . $work['id'] . '" ' . $selected . '>' . $work['name'] . '</option>';
                    }

                    if (isset($_POST['start'])) {           // Clicked Start button
                        $start_result = startCounting($selected_work);
                        ?>
                        <script>
                            //showTime();
                        </script>
                    <?php
                    } else if (isset($_POST['stop'])) {     // Clicked Start button
                    $stop_result = stopCounting($selected_work);
                    ?>
                        <script>
                            //showTime();
                        </script>
                        <?php
                    }

                    if (!$works) {  // There is no work name in DB
                        $current_spent_time = 0;
                    } else if (!$_POST) {   // There is nothing in POST
                        //$current_spent_time = $works[0]['spent_time'];
                        echo "there is not POST";
                        end($works);
                        $id = intval(key($works));
                        echo '<script type="text/javascript">'
                        , 'showTime();'
                        , '</script>'
                        ;
                    } else if ($_POST) {
                        //echo "there is POST";
                        // Create New Work Name
                        if (isset($_POST['create']) && isset($_POST['new_work_name']) && $_POST['new_work_name'] != NULL) {

                            $new_work = $_POST['new_work_name'];

                            $check_name = Db::query('
                                                                SELECT *
                                                                FROM work
                                                                WHERE name = ?
                                                                ', $new_work);

                            if (!$check_name) {
                                $result = Db::query('
                                                            INSERT INTO work (name)
                                                            VALUES (?)
                                                            ', $new_work);
                                if ($result) {
                                    $create_result = 'New work name was successfully created!';
                                } else {
                                    $create_result = 'New work name failed to create!';
                                }
                            } else {
                                $create_result = 'This work name already exists, try something different.';
                            }

                            $current_spent_time = 0;
                        }

                        $current_spent_time = checkWork($selected_work, "spent_time"); //currentSpentTime($selected_work);
                    }

                    $current_spent_time = gmdate('H:i:s', $current_spent_time);
                    ?>
                </select>
            </div>
        </div>

        <section id="btn_start_stop">
            <div class="row"> <!-- Start, Stop Result-->
                <div class="form-group text-center">
                    <?php
                    if (isset($start_result)) {
                        echo $start_result;
                    } else if (isset($stop_result)) {
                        echo $stop_result;
                    }
                    ?>
                </div>
            </div>
            <div class="row"> <!-- Start, Stop Buttons-->
                <div class="text-center col-xs-6 col-sm-6 col-md-6 col-lg-6">
                    <button type="submit" name="start" value="Start" class="buttonStart">Start</button>
                </div>
                <div class="text-center col-xs-6 col-sm-6 col-md-6 col-lg-6">
                    <input type="submit" name="stop" value="Stop" class="buttonStop">
                </div>
            </div>
        </section>

        <section id="output_section" class="container">
            <div class="row"> <!-- Time-->
                <h2 class="text-center">Time spent on this task: </h2>
                <h2 id="counter" class="text-center" value="<?php //echo $current_spent_time;          ?>"><?php echo $current_spent_time; ?></h2>
                <h2 id="test" class="text-center"></h2>
                <input type="hidden" id="" />
            </div>

        </section>

        <div class="row form-wrapper col-md-10 col-md-offset-1 col-lg-10 col-lg-offset-1"> <!-- Create new work name-->
            <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
                <div class="form-group">
                    <input type="text" name="new_work_name" placeholder="Enter new work name..." class="form-control"/>
                </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                <div class="form-group">
                    <input type="submit" name="create" value="Create new work name..." class="btn btn-primary"/>
                </div>
            </div>
        </div>
        <div class="row form-wrapper col-md-10 col-md-offset-1 col-lg-10 col-lg-offset-1"> <!-- Create new work name-->
            <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
                <div class="form-group">
                    <?= $create_result; ?>
                </div>
            </div>
        </div>
    </form>
</div>

</body>

</html>

<?php ?>