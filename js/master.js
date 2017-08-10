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
    if (id == "" || id == null) {   // no work is selected
        var work = document.getElementById("work_setlist_id");
        id = work.options[work.selectedIndex].value;
    }
    if (id != "" && id != null) {
        http_request = create_XMLHTTPRequestObject();

        var variable = "work_id=" + id;
        http_request.open("POST", "work_time_ajax.php", true);
        http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http_request.setRequestHeader("HTTP_X_REQUESTED_WITH", "xmlhttprequest");

        http_request.onreadystatechange = function () {
            if (http_request.readyState == 4 && http_request.status == 200) {
                // spracovanie JSON udpovedi z work_time_ajax.php
                var response_work = JSON.parse(http_request.responseText);
                console.log(response_work);

                // Show spent time of selected work
                var counter_time = response_work["spent_time"];
                counter_time = secondsToHms(counter_time);
                document.getElementById("counter").innerHTML = counter_time;

                // set work id to start function
                document.getElementById("buttonStart").setAttribute("onclick", "showTime(" + response_work["id"] + ")");

                if (response_work["work_started"] == 1 &&               // this work is running
                    localStorage.getItem(wtc_ticking_counter) == null)  // localStorage is not counting
                {
                    localStorage.setItem(wtc_ticking_counter, counter_time);

                    var myTime = setInterval(function () {
                        myTimer(response_work["id"]);
                    }, 1000);
                }
            }
        };

        http_request.send(variable);
    }
}

function myTimer(work_id) {
    var counter_time = localStorage.getItem(wtc_ticking_counter);

    var total_time = counter_time.split(":");
    counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
    counter_time = secondsToHms(counter_time);

    localStorage.setItem(wtc_ticking_counter, counter_time);

    if (work_id == document.getElementById("work_setlist_id").value) {
        // citame z hidden tikajuceho elementu
        document.getElementById("counter").innerHTML = localStorage.getItem(wtc_ticking_counter);
        console.log("ukazujeme ticking time");
    }

}

function create_XMLHTTPRequestObject() {
    if (window.XMLHttpRequest) {
        // Code for IE7+, Firefox, Chrome, Opera, Safari
        return new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        return new ActiveXObject("Microsoft.XMLHTTP");
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