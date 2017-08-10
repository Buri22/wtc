
function showSpentTime(id) {
    if (id == "") {   // no work is selected
        document.getElementById("counter").innerHTML = "";
        return;
    } else {

        xmlhttp = create_XMLHTTPRequestObject();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                document.getElementById("counter").innerHTML = xmlhttp.responseText;
                runClocks(id);
            }
        };

        xmlhttp.open("GET", "work_time_ajax.php?work_id=" + id, true);
        xmlhttp.send();
    }
}

function runClocks(id) {

    http_request = create_XMLHTTPRequestObject();

    var variable = "work_id=" + id;
    http_request.open("POST", "work_time_ajax.php", true);
    http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http_request.onreadystatechange = function () {
        if (http_request.readyState == 4 && http_request.status == 200) {
            if (http_request.responseText != 'false') {
                // code for running
                //console.log(http_request.responseText);
                var myTime = setInterval(function () {
                    myTimer()
                }, 1000);

                function myTimer() {

                    var counter_time = document.getElementById("counter").innerHTML;
                    var total_time = counter_time.split(":");
                    counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
                    counter_time = secondsToHms(counter_time);

                    //console.log(counter_time);

                    document.getElementById("counter").innerHTML = counter_time;

                }
            } else {
                document.getElementById("test").innerHTML = 'This work did not started.';
            }

        }
    };

    http_request.send(variable);
}

function showTime(id) {
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            // document is ready. Do your stuff here
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

                        var counter_time = response_work["spent_time"];
                        counter_time = secondsToHms(counter_time);

                        document.getElementById("counter").innerHTML = counter_time;

                        if (response_work["work_started"] == 1) { // this work is running

                            if (document.getElementById("counter-ticking") == null) {
                                // Create an hiddent DOM element for storing ticking time of started work
                                var div = document.createElement("div");
                                div.setAttribute("style", "display: none;");
                                div.setAttribute("id", "counter-ticking");
                                div.setAttribute("value", response_work["id"]);
                                document.body.appendChild(div);

                                document.getElementById("counter-ticking").innerHTML = counter_time;

                                console.log("vytvorili sme hidden div");
                                //console.log(document.getElementById("counter-ticking"));

                                var myTime = setInterval(function () {
                                    myTimer(response_work["id"]);
                                }, 1000);

                            } else {
                                console.log("Nevytvorili se hidden div, pretoze uz existuje");
                            }

                        }
                    }
                };

                http_request.send(variable);
            }
        }
    }

    //});
}

function myTimer(work_id) {
    var counter_time = document.getElementById("counter-ticking").innerHTML;

    var total_time = counter_time.split(":");
    counter_time = Number(total_time[2]) + Number(total_time[1]) * 60 + Number(total_time[0]) * 60 * 60 + 1;
    counter_time = secondsToHms(counter_time);

    document.getElementById("counter-ticking").innerHTML = counter_time;

    if (work_id == document.getElementById("work_setlist_id").value) {
        // citame z hidden tikajuceho elementu
        document.getElementById("counter").innerHTML = document.getElementById("counter-ticking").innerHTML;
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
        