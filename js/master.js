//================ Variables ================//
const wtc_ticking_counter = 'wtc_ticking_counter';

//================ Functions ================//
function showTime(id) {
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            // document is ready. Do your stuff here
            getTime(id);
        }
    };
}

function getTime(id) {
    if (id != "" && id != null) {
        xhr("POST", "work_time_ajax.php", "work_id=" + id, {success: function(response_work) {
            var spent_time = response_work["spent_time"];
            spent_time = secondsToHms(spent_time);

            // Show current work spent time
            showMessage("counter", spent_time);

            // Set current work id to start function
            document.getElementById("buttonStart").setAttribute("onclick", "startWorking(" + response_work["id"] + ")");

            if (response_work["work_started"] == 1 &&               // this work is running
                localStorage.getItem(wtc_ticking_counter) == null)  // localStorage is not counting
            {
                localStorage.setItem(wtc_ticking_counter, spent_time);

                var myTime = setInterval(function () {
                    myTimer(response_work["id"]);
                }, 1000);
            }
        }});
    }
}

function startWorking(id) {
    // Check if some work started
    xhr("POST", "work_time_ajax.php", "work_started=check", {success: function(work_started) {
        if (!work_started && id != "" && id != null) {   // No other work started
            // Update work in DB
            var data = "start_work=true" +
                        "&work_id=" + id +
                        "&last_start=" + new Date().getTime() / 1000;   // We store time in seconds

            xhr("POST", "work_time_ajax.php", data, {success: function(response) {
                if (response) {
                    getTime(id);
                    showMessage("startStopResult", 'Started successfully!');
                }
                else {
                    showMessage("startStopResult", 'Failed to start this task.');
                }
            }});
        }
        else {
            showMessage("startStopResult", "You are already working on: " + work_started["name"]);
        }
    }});
}

function myTimer(work_id) {
    var counter_time = localStorage.getItem(wtc_ticking_counter);

    var total_time = counter_time.split(":");
    counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
    counter_time = secondsToHms(counter_time);

    localStorage.setItem(wtc_ticking_counter, counter_time);

    if (work_id == getSelectedWorkId()) {
        // Read from localStorage
        document.getElementById("counter").innerHTML = localStorage.getItem(wtc_ticking_counter);
        //console.log("ukazujeme ticking time");
    }

}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

function deleteLocalStorage() {
    localStorage.getItem(wtc_ticking_counter) != null && localStorage.removeItem(wtc_ticking_counter);
}

function getSelectedWorkId() {
    return document.getElementById("work_setlist_id").value;
}

function showMessage(elementId, message) {
    document.getElementById(elementId).innerHTML = message;
}

//================ Execution ================//
function execution() {
    getTime(getSelectedWorkId());
}