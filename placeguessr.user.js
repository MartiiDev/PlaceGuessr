// ==UserScript==
// @name         PlaceGuessr
// @namespace    https://github.com/MartiiDev
// @version      0.1
// @description  A Geoguessr alternative directly on Google Maps' website!
// @author       Martii (Edgar Caudron)
// @include      *://map*.google.*/play
// @include      *://www.google.*/maps/@*
// @grant        window.onurlchange
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @require      https://unpkg.com/leaflet@1.7.1/dist/leaflet.js
/* globals jQuery, $, L, waitForKeyElements */
// ==/UserScript==

/*
Information for players:
This game is not really meant to prevent cheating so there are plenty of way to cheat (coords in URL, using devtools console...).
So if you want to enjoy the game please try not to cheat :)

Also, it might not work anymore in case of an update in google maps code.
And yeah, for anyone looking at my code, I know it's dirty as hell, and not optimized.
*/

// TODO: Rounds, round end modal, map showing real location after guessing,


//////////////////////////////////////////////////////////////
//                        UTILITIES
//////////////////////////////////////////////////////////////

function tabIdentity() {
    var titre = "PlaceGuessr - Geoguessr alternative"
    document.title = titre;
    window.addEventListener('urlchange', function(){
        window.history.replaceState(null, null, "?ingame");
    });
    try {
        window.originalTitle = titre;
        Object.defineProperty(document, 'title', {
            get: function() {return window.originalTitle},
            set: function() {}
        });
    } catch (e) {}

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css"
    }).appendTo("head");
    $("<link/>", {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACcUlEQVQ4T3WTTUiUURSGn/M5ZgamkTpDVouCoKAgoSSiH8OcTy0sCSFyZjJa1CK3/ZAlpFHbgqBNNqO0kMLKmB8MRIKgCJEoqHARYTiflaWL0By/E/PNaJNNd3fPuffhved9r7BorbrXV2zP5baochjYkGrLe0F7c9R143Og6lvmFcnceILRShV6gOLF4PR+XLAb4/7awfn+AsDTHdmmtjEImg+8UdXr4sp9njyoc4mdAueATcBPQ9g15jOHHG0Oqa3NcK/bMQy6WYXIskRew8fmyulMFat7evJnZwoeolKNMGw1ecsRUQfgDkarEPpRJl241iffWRZ8ujIhiTAqdu6s1o2eNCc8d8Il6jJGgOWi7IsHzIF5QAfCBYW7436z2YGGYgdBH6dkal3cXxN26l2xLlSbRLgS95mXHEBpKNopcBy01fLXtCdrjuTpwpugdsEP+8xIS+1Msu4JRtpU5DIity2f91RKQSh2FfS8QCjuNwP/ccApu0ORbpBjIO2W39vqADxdkb2qMgBM/Vqas/Z74/7JbJCizoGivJyZT0CBIewe85nPUi6oirsr9hbYCHRYfvNiNoA7GL2GcDZps+XzbllwITWHSIMgD4AZVd0+Hqh5nQkpCYa3GmK8AHJRDlkB89GfHKRPukPRPuAA8G7WsCsmmmqnkq0VPf2FedNzLzUZbZFey+dt+CeJ6WGWAkOgZSBha82Sej4UiCf/a5+CV2HUSNjl8RO1X7IC0pAKYMCJtEg3tuYgHHUijLFnzF/9KvNpf32m+YY7GK1HuA+40rVZVBqsgPfJ4uFmBaQCEzuiorcAW1VPjwdqerM58xs+j+8RQLaz0AAAAABJRU5ErkJggg=="
    }).appendTo("head");
    $("<link/>", {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFMklEQVRYR51XbWwUZRB+Zq/XOzRUgnB3rVARCkYS0EQNCIg0YG+vfKh8NHzdFtDAD4Q/GP1l0vjLGDUR+SFKoL2jokXRSHof0NgYhGIgRhMQIQoiUG+vrWA1gZbbHfNe7667e3u9K/tvZ56ZeXZm3pl3CaU+TU2S55E5cyRgJRPNAzAdwISMeQ8Bl5hxEkRfqZe7zqCpSS/FNRUFMZM3FF8BwlsAZhfFA2DgRwn8ZkIJRIrhRyQwaV9s/F0X7QPzS8Uc2egZjMODYxxbbzY8/08h+4IEqlqOV+ukHWdgxj0EN5qc15xSXe+6um47P7YEPJ92eCmV+h5AjY3RH0x0GLreJYFuCL1OPEkims+MNQAm29hccA5iwfVX5L+tunwCbW0O7+2KOAiLLeA+ML2uVpeHUFubss3K3rNOj7tnCxG9DWCcGUMRNVi3DERslOcR8ITjW4l5ryXABcmhBf7asPRqKeXwNEemkSTFAUwz4pnQmAzKoYIEphzodN92DFwGUJkDMbq1cunpQjUsRKiytf1hXXOcATDRgLn2oLu/5peGhsGszJQBTzimEKPFxJCwLBGU262BMtjtYNIh6bvVYOBQHiYUXUmgL01yprVqo/9zWwLeULwd4PqskoETSUVeaHXsDUdXgOlrANkP0Blcn1QCIu3Dj5gh4XgXgDmGgEcSirwqj8DMtrbyvjsVokvvH1by5oQSaM4nEA+DeaNFvl9V5JfzstAS3UZEHxnkPaq7vxINDZqQ5Urgbe2YCi31u5F/maRX39hYfz2PQCi6G6AdlmZ6L6HIr1mxE1raZzjIcdEg17msrCq5folqIlDZHF+oS/ydAfifevn0A3YzPdPlpwB40nhGt0Ojud1b/NesBKr2Hr1PG+O8BcA5rKNZquI/ZyLgC0cXMVOnwUG/GvSPs57brD49rLTUWuikO5yDh7rXL++1BhfvNbsjrn/HSWIUu3K9RXgiGZR/NhGoCkcf1Zh+LaUEdoEKySa2HpsuafolYwlSfLe6r3F5eormeiDThOIrxg4zpW3JoP/j0QS06ZedAH1gkCdVd39VXhMKgC8U+4KB3BEB0KUqstj99/x4wrGzxHgy54BxSG2U12ffTYPI1xJfzcSHjdFYlxYkN9WdvBcGvpZYLRO+NdkSv6AGA9/YEkiX4XbFFRCqDEadatC/uFAzFiTW1CR5p84VG/UZA+aqOtlVY1xm+csoFNtFwLumLIBXJZXAkdFkwRuKiTS3Gm2IsCMRlPeYZPlNExeT8CLAD+WaEbg+qLlm3dpcK85z0ccbinsAFufcuIiujL2lP/bbzvqBEQkIpR17gD5TFf+6otGHUi8W0IsGLDNhTTIomxeT8RiaHA85EYtliSXgVlWRPxmJhC8ce5UZH5oxfFRVAivs7AreCX0HolPYQWJaVRgMBwB6TlX8P9g58zQfm0+SLrq+3KDv05zS7FHdCbPG3nB0HZhEIw0TLTD3M8vstKXuzODVIzVw0f8CTyi2h4Dtli8+53KkFv65YdnNoZ6Jewh8wnqDJsL7iaC8a6SSFSUgZkPvnYoOAp61ODoFUN2gWyorv5PqAOgpi75DdffL2ZFbiERRAsLQtz8ykcsksX6t1/ROBspsyF0Y0FzzSjm2JREQJDJb7YTI+MhHkW5IjtT8Um/QJRMQQT3h2OPE6dk+vgCJXtKxKLFJPl90XmQAoyKQbriDkbnQpBgID1iC9OmatKRnc91PpQYXuFETSPfEwchM1qV3ANQO/QzjuMbaG72NS40Xj5J4/A9yTfEw3HoJ9gAAAABJRU5ErkJggg=="
    }).appendTo("head");
}

function gameUI() {
    //// Hide Google StreetView's UI
    document.getElementById("titlecard").style.display = "none";
    document.getElementById("image-header").style.display = "none";
    document.getElementById("streetviewcard").style.display = "none";
    // document.querySelector(".app-viewcard-strip").style.display = "none";
    document.querySelector(".scene-footer").style.display = "none";
    document.querySelector("#snackbar").style.display = "none";
    document.querySelector("#pane").style.display = "none";
    document.querySelector(".app-horizontal-widget-holder").style.display = "none";
    document.querySelector("#minimap").style.display = "none";
    document.querySelector("#minimap").innerHTML = "";

    //// Create PlaceGuessr's UI
    $("<link/>", { rel: "stylesheet", type: "text/css", href: "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css" }).appendTo("head");
    $("<link/>", { rel: "stylesheet", type: "text/css", href: "https://use.fontawesome.com/releases/v5.12.0/css/all.css" }).appendTo("head");
    $("<link/>", { rel: "stylesheet", type: "text/css", href: "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" }).appendTo("head");
    var customCss = document.createElement('style');
    customCss.innerHTML = `
        #guessButton:disabled {
          background-color: lightgrey;
          color: black;
          cursor: not-allowed;
        }
        #miniMap {
          position: absolute;
          z-index: 1000;
          width: 200px;
          height: 200px;
          bottom: 0;
          left: 0;
          -webkit-transition: width, height, 0.2s ease-in-out;
          -moz-transition: width, height, 0.2s ease-in-out;
          -o-transition: width, height, 0.2s ease-in-out;
          transition: width, height, 0.2s ease-in-out;
        }
        #miniMap:hover {
          width: 375px;
          height: 375px;
          z-index: 1000;
          transform-origin: bottom left;
        }
        #scoreBoard {
          position: absolute;
          z-index: 1000;
          right: 0;
          top: 0;
        }
.modal-backdrop {
  z-index: 1000;
}
.modal {
  z-index: 10000;
}
    `;
    document.head.appendChild(customCss);

    var buttonGroup = document.createElement("div");
    buttonGroup.setAttribute("id", "navButtons");
    buttonGroup.setAttribute("class", "btn-group");
    buttonGroup.setAttribute("role", "group");
    buttonGroup.innerHTML = `
        <button class='btn btn-info' id='guessButton' disabled type='button' style='background-color: rgb(40,167,159);'>
            <i class='fas fa-globe-europe'></i>&nbsp;Make a guess
        </button>
        <button class='btn btn-danger' id='resetButton' type='button' style='background-color: rgb(167,48,40);' onclick="backtoStart()">
            <i class='fas fa-fast-backward'></i>
        </button>
    `;
    document.body.appendChild(buttonGroup);
    $("#guessButton").prop("disabled", true).click(function(){ endGame(); });

    var minimap = document.createElement("div");
    minimap.setAttribute("id", "miniMap");
    minimap.setAttribute("class", "card");
    document.body.appendChild(minimap);

    var scoreBoard = document.createElement("div");
    scoreBoard.setAttribute("id", "scoreBoard");
    scoreBoard.setAttribute("class", "container-fluid");
    scoreBoard.setAttribute("style", "width: auto;padding: 0;");
    // scoreBoard.innerHTML = `
    //     <div class="card">
    //         <div class="card-body" style="padding: 10px;padding-top: 7px;">
    //             <p class="text-left card-text">
    //                 <span id="round" class="round"><em>Round:</em>&nbsp;1/5<br></span>
    //                 <span id="roundScore" class="roundScore"><em>Last score:</em>&nbsp;0<br></span>
    //                 <span id="totalScore" class="totalScore"><em>Total score:</em>&nbsp;0<br></span>
    //             </p>
    //         </div>
    //         <div id="timerdiv" class="card-body" style="padding: 10px;padding-top: 7px; border-top: 0.5px solid lightgrey;">
    //             <p class="text-center card-text" id="timer">∞</p>
    //         </div>
    //     </div>
    // `;
    document.body.appendChild(scoreBoard);

    var endModal = document.createElement("div");
    endModal.setAttribute("id", "endGame");
    endModal.setAttribute("class", "modal fade");
    endModal.setAttribute("role", "dialog");
    endModal.setAttribute("tabindex", "-1");
    document.body.appendChild(endModal);
    endModal.innerHTML = `
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <h3 class="text-center"><i class="fas fa-map-marker-alt"></i> <span id="distance">0</span> km</h3>
                    <div id="roundMap"></div><br>
                    <p class="text-center">Your guess was <strong><span id="distance">0</span> km</strong> away from the actual location.<br>You have scored <strong><span id="points">0</span> points </strong>this round.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary closeBtn" type="button" style="background-color: rgb(0,178,255);">
                        <i class="far fa-hand-point-right" style="padding-top: 4px;"></i>&nbsp;Continue
                    </button>
                </div>
            </div>
        </div>
    `;

    $('body').append(`
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>
        <script>
        //// Go back to start
        function backtoStart() {
            if (confirm('Return to your start position?')) {
                window.location.href = "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint="+sessionStorage.spawnX+","+sessionStorage.spawnY;
            }
        }
        </script>
    `);
}

function startTimer(duration) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById("timer").innerHTML = minutes + ":" + seconds;
        sessionStorage.timer = minutes/60 + seconds;

        if (--timer < 0) {
            endGame();
        }
    }, 1000);
}

function getIndex(str, char, n) {
    return str.split(char).slice(0, n).join(char).length;
}

function getUrlParam(param, url) {
    var current_url = new URL(url);
    return current_url.searchParams.get(param);
}

function inRange(x, min, max) {
  return (min <= x && x <= max);
}

function endGame() {
    if (sessionStorage.spawnX && sessionStorage.guessX) {
        var lat1 = sessionStorage.spawnX;
        var lon1 = sessionStorage.spawnY;
        var lat2 = sessionStorage.guessX;
        var lon2 = sessionStorage.guessY;
        const R = 6371e3; // earth radius in metres
        const φ1 = lat1 * Math.PI/180; // φ, λ in radians
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = R * c / 1000;
        var distance = (Math.round(dist * 100) / 100).toFixed(2);

        //// Real basic point thresholds depending on kilometer distances
        var points;
        if (inRange(distance, 1, 2)) {
          points = 10000;
        } else if (inRange(distance, 3, 10)) {
          points = 7000;
        } else if (inRange(distance, 11, 50)) {
          points = 4000;
        } else if (inRange(distance, 51, 200)) {
          points = 3000;
        } else if (inRange(distance, 201, 500)) {
          points = 2000;
        } else if (inRange(distance, 501, 800)) {
          points = 1000;
        } else if (inRange(distance, 801, 1300)) {
          points = 500;
        } else if (inRange(distance, 1301, 1600)) {
          points = 400;
        } else if (inRange(distance, 1601, 2300)) {
          points = 300;
        } else if (inRange(distance, 2301, 2800)) {
          points = 200;
        } else if (inRange(distance, 2801, 3200)) {
          points = 100;
        } else if (inRange(distance, 3200, 4500)) {
          points = 50;
        } else if (inRange(distance, 4501, 6000)) {
          points = 25;
        } else {
          points = 0;
        }

        alert("Your guess was "+ distance +"km away from the real location.\r\nYou scored "+ points +" points");

        // document.getElementById("distance").innerHTML = distance;
        // document.getElementById("points").innerHTML = 0;
        // $('#endGame').modal({
        //     backdrop: 'static',
        //     keyboard: false
        // })
        // $('#endGame').modal('show');
    } else {
    }

}

document.getElementById("toggleGameBtn").addEventListener("click", toggleGame);
function toggleGame() {
    alert(0)
    button=document.getElementById("toggleGameBtn");
    if (button.innerHTML == "Activate Game") {
        alert(1)
        button.innerHTML = "Activate Google Maps";
        localStorage.placeguessr = true;
    } else {
        alert(2)
        button.innerHTML = "Activate game";
        localStorage.placeguessr = false;
    }
}

//////////////////////////////////////////////////////////////
//                          GAME
//////////////////////////////////////////////////////////////
(function() {
    'use strict';

    if (window.location.href.includes("/play")) { // Main menu
        document.head.innerHTML="";
        document.body.remove();
        tabIdentity();
        document.body = document.createElement("body");
        document.body.innerHTML = `
<style>
    .bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    @media (min-width: 768px) {
        .bd-placeholder-img-lg {
            font-size: 3.5rem;
        }
    }
    .carousel-caption {
        transform: translateY(-195%);
        letter-spacing: 0.1em;
        text-shadow:
            0.025em 0 black,
            0 0.025em black,
            -0.025em 0 black,
            0 -0.025em black;
        }
</style>
<header>
    <div class="navbar navbar-info bg-info shadow-sm">
        <div class="container d-flex justify-content-between">
            <a class="navbar-brand d-flex align-items-center text-white">
                <strong>PlaceGuessr</strong>
            </a>
        </div>
    </div>
</header>
<main role="main">
    <section class="jumbotron text-center">
        <div class="container">
            <h1>PlaceGuessr</h1>
            <p class="lead text-muted">A free alternative to Geoguessr, working in Google Maps itself !<br>You can add this page to your favorites to launch the game quicker !<br><b>You have to use the button below if you want to use Google Maps ! (will be changed in a future update)</b></p>
            <p>
                <a href="https://www.google.com/maps/@0,0,3a,75y,90t/data=!3m3!1e1!3m1!2e0?ingame&mode=world" class="btn btn-info my-2">Start a game</a>
                <a href="#" id='toggleGameBtn' class="btn btn-danger my-2">Activate game</a>
            </p>
        </div>
    </section>
    <div class="album py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <img class="card-img-top img-responsive" src="data:image/jpeg;base64,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">
                        <div class="carousel-caption">
                            <h3 class="text-dark">World</h3>
                        </div>
                        <div class="card-body">
                            <p class="card-text">Explore the whole world, discover new places and don't get lost !</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    <a type="button" href="https://www.google.com/maps/@0,0,3a,75y,90t/data=!3m3!1e1!3m1!2e0?ingame&mode=world" class="btn btn-sm btn-outline-success">Play</a>
                                    <a disabled type="button" href="" class="btn btn-sm btn-outline-secondary">Custom</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <img class="card-img-top img-responsive" src="data:image/jpeg;base64,/9j/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAC2AWwDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAABgMEBQcAAggBCf/EAEQQAAIBAwMCBAQEBAQFAgUFAQECAwQFEQASIQYxBxMiQRRRYXEjMoGRCBWhsUJSwdEWJDPh8GLxFyVDU3ImNDVzkoL/xAAcAQACAwEBAQEAAAAAAAAAAAADBAECBQAGBwj/xAAxEQACAgEDAgMFCAMBAAAAAAABAgARAxIhMQRBEyJRYXGRocEFMkKBsdHh8BQj8VL/2gAMAwEAAhEDEQA/ALfo+lblC0AqksdyAeSSbdIV3Fhwv5Rt28YwNDr+G92mo6eNrP09VyRwsjuskUZkJQgYxtz6sHnR5uOAynJPy5ONeM2DjOQB8xr0XgehnmD1vqJWdR4ZdT1SKsXTdAUi2iNIaxCqgD2Akz3576JZujr7XWehiqel5IJUmIlKTggJsAGzBPqLfpjRIX37ScA/YaUWSQAjAAz+uuOBj3/vxkDrEANrz7f4laT9F3+lpmmprNfoKoAlhUI5j7AjGMZOdw+vGmFRaLhV1Re4Wq4jJVgIqWRnLqf8RJII9wcHVupW1Kf9ORgD/lc4++lo+oblHgCrqFHbb5p7fvrjiyV2lR1WK73+MqOv6Zs10tVLNcbfcKWrqZWikZ49sikAkEHbwDx+vGda9P3Tp7pLp0Nvu1Uk0gbyXYARscAq23bgD6gk+w1dC9ZXdQoapkb6v6if115SdTTU1L5CUVH5GSfL+HAXk5J7c5JJ0E4MpH8w69Z04Pf4fzKGmu1l6rkeip71W0An3OIqfaVkduNvIHc4wRjtnUpZOnIprEgg60qo4KqmVnpaiFTlc44ccj1Z5HyOrbrqqzVz767pa0VMjZy70qZz8+2mv8m6OqPLMvSsERSMwhqKRosIckjgjjntoRw5vT9IVes6bu3yMrSo6cp0tctLT9UzJMhZp6mpQkOGBQKFzxj9eRnS79F0UTwVlZ1iXj8qOXyIk3GaNfyk7TyT7nRlL4Y+HNyCD+XXKkdfysla3BznIydar/D90XXyedBd73TPuO1FlV0VTztAKn+/7aGy5F5BEYTLgycMp/OoJWm20dcsNTTXyCegp5PXTzzEllHYBiPSx+mcakrpX9NwR1FpkcJPcCqSQpUFjGx44OeBzyT7g8DUhD/CzBFHJBT9QXIQsN3nSRr6zntsH5R+uoHqj+GrqSS8LcaXqKRtsZWJjBJ5qtn0g54IOeTn58aXLb8xwA1wJFVvhHGY3hoKyoCCDcIFUyENjksxbG3HGAOP10L3XwXvRt3/AOnWqLhJvGYgI1UNxvyCwORn5caL6rwm8R7bOtZaJrfIgwZN2d7AcEFMd/SBj+mo+09P9d9D3qp/mHT5udDNE4/Ck3T7nfI24PqflTg4B5GdRrJ3uccQ40wWh8NLmbTNItrq0CxvJugDTy7sn0kD0Hkex9wdN4/DS7WagFZMt3zIyRz0lLHGsoLKNoZGbPcsOf8AKdFtlofEXpqwI1NbLnTwxvAzpFEqJKgJ8zarHdv5+QBAPGivprxXpKPpuGzXFRU34o0s1FU07GVnBOGLEjsBuA788fWpysdxJXCiiiN5W9T0TIKqOkqqn+d08cckFPPBPEUjkXGFyrZYk4A9udQFv8L7yKlEutNJbZPNXyVqDvR48+rcQRg9gOf315Y/EOn6d8Q6e41MWKSOsYSyU4PpG0gen8vfIwfnz21dVBUUnVd1SthkulJSy1UcclNVUIC1LlmJyTz2X2OO2qtlKGpfHiTILqpTFyrG6LSeOPpmKtiYPJFWTQMSPUAGByQygg8Ng9+/fTut8Meo718PFB/LSYl8sVdLO4jqN2CCq7Sq8AA7cZxq9ILjBFdEnFppZIKupngipYpkhVWSJgA4AwxI7Bf++hPxG6psHTV2p6SrtNxSZoIGjpKCoaOKNVydrgEEgHJGMEAkfahzd4TwBxcErP4FTpb0NdTL/NI52b1zkLMoI2jYM55yCOOT8tM63oesgsEtuuUCWWhoapCkgmSRncsclmBG3O7A+g0d3/xZi6UtFzqrBSIk1FSZkeeSolZZCgYDc4BIBfuSeRrnm++P3VVfUzzrWmE1X4siB22h/fGWJxnnHYaIpYi4I6F2ELbTU1tJ1AYL5e6FrVb1ZtnxymR0AOBGATk8D3OMY502nq4qOpvFziqIZqsSxmFUni/ChIBHbO5icA/6aCaTxZ6kufkUoMlTO7iKNaeFfNdvkvByTn5HRf0fW9W3q/1FDDBQdOTxUizeVeWWnLxFivBKAnkMOw/trmYruTIRA/lAmtuN3u9wqadaKEUqkQPNVAKoBOdjbVLEk+2Prxr25dJDpwQUsluoRLWLuRfJeTO1snDyqCpx7A9tWfQ9DVt9t6VFfbbRFc0qlMNfbqxZYtu3KldrMVb25X3GPpPUXhhQBZbf1JLS19IrhIUXbslc5O9ZRnkYZQDtyc98aEeoF8xkdIwH3ZSUDdP1ZgW4W+kMS4kCUrtAz7mwTIRngY7HH0I1IdSeH/RdLdAsV9qrdAzlfJ2rOqkAZ2PwWGTgcE+x1e9q8ObLLSNZxSU9Q1KQJiH2FWOGTzGLEkHBxk/LA40yl6T/AOH/ACbmtFWN5T+VDHBE0ihtpb1IR+XCjnGBjQl6vGTQjDfZ+ULbVOW750nU2+7iktsUlXF5fmBJAsTBeM8Hg+xyPnpGXo2+S05nFmrGRX2s8ERlCd8ZIzgnXStTG732onraK5Vi3MLKrS2xiFKjagVwcZwzd+cgEjgDSi3GeSC41dsuzWaqjIpIaOstMpcDcfSrFcNvIyAQxwOANFPUDtFx0ntnNnSsc1HXyW2ppfKNchj3VinnndsHpJycew740Uy2zp6yVo+OrqihljjaWKGKBjNuC+lSjA4BOMA6vDperpN1LLV2yWe6vMxjIp4kRwoHJUIGjO4HvyRxxreXqmz3K91ceFee3K7VTSxCOZCoIZQ+NvpPbPtwM6oep3qoUdEQtkznqp6dkrKVKqsjuVLDUxiaEyUwR5VYnD+2RkNz9DqQ6ct1vpFpqKSyVtwco8pjmidA5xw4IJACjJHBGBzq6VvtNf7vTJ/wxW1dqaFJ4a2I+cDJu2gKANqYHJyMfpp/aunE6pvt2g/lFfSR0L+TFVO6x4zGcHBAL8nnbxgY1cZVPO0EcBU+Xec51tzpDXtGa6tgpEK+XFUMCwyfX7YAwBjA0zt1/WkuCNMklbAu2SHfGTHw3O7BGQB7Z74+2uhupOgaOz0MVLJQVFRe6SAyQG3KoinO7EjgsOBnBAHucZJ41DVPS9Wtvp6KltP8yplj3BayD4eTEkiqY8DPqDZkPPb1anxlWQOmdt5z1emSruSiOplWmdmy8v4mOTgAZH0/c6jo5pNslOs6VEQIdW8wr79gOw+fbXRvTHhz0Z1Dbv8AiCgqYqdoK2SARq+XjmEoQAeollbB9XOFfPtokbo2y2yneS311mstLVu1W048tlcgEMoMjcryTwB+XB1x6hZC9I7bzmbpixv1r1dT0NNRmKD81SaaLKxxKMs/24AJPudTU9b09PQy0E8K09LSTPNHPTIXqqsM4CxbzxHtXcfkfqddMWTw/e3T+bALbHVVYAe5UtOySVCY3btoXZwOwUYPfQhWfw3WmZpnK3FS8vmCqREAYZBIAAAGATz2+ROuOZeSZP8AjZLoCVXX9O9C/wAhslxairYknMolhWsYNGofanmPtILEc8AaE36GlmoBPC8bSPMyxrJVwqCueCDuznHfI10BXeDfTCTyU8NJFJHCwhmkW41Em1wF2Fl24ctngKP8RGdSfUXhnaaiCjkewUdSi5xUxP8AB+b6toUKzKdwxzx7e2NcMg9ZZsLcESjKCx0PTkFueNnXqpm3rDInmFDsyu1CCp7jkg850/sPhdBfqE1KdSPK+7ErR1kEC7yAxAWQhuM4z8wdFr+HfUPTb3miFRC9dU0oqHkqHSRIYww3ZdlLZztUYxznUBXdHi01LwtVSTxElopmEcPmLnG4KyEgbg2rB74Mp4ZHKzrWK1wrwXbaf83A0ottpscktntqAXrsxggwq5P/AKT/AL6dR9dptBenRePzDgY/fXoiuWeJDYZNDp6GTlWAB9iNKR9Jbh/1ox9c6hU66iYEmnj25wSzE4OnCdc0x9UlHsH+YSc/bVCMw4hAem7/AFklJ0SrYIqcA+w5ydb/APBCtjFVx2xptD1nbiu8pNGM8kn+2lR1fatgLTyxDGfUhI/pqhOcf8hAvS+z4xUdB7uGqyVPGtR0EF71T9v8LZ0rB1NbqrIjq0fGO6kf6aUF2pyTmoVeffIyc6rrzDk/KX8LpTwPnG3/AAGpJ/5qXH0I1n/AYUk/FS8984/pp2LpRnIFVFn82N3b99brWQkBllj9sDeNR4mXuZ3gdOfw/OMP+AznPxcgA44xr0dBNxtrJVPfOBqTSfeSRhjxjbKB+ul0kkjyUSX77wf9dQc2X1kjpcH/AJ/WRS9H1MR9F1qQfkO399PYuna6CNkW8VHPJJCnH76fJVzSKMxy/TIB/wBdLpK7gECTIHJZR/voRyueajCdPhH3QfiYhTW25IMG7zSL7ho0IP8ATTo2+QlTMY5l5ByoT+2P763FS4TBDnHvt14a8YOCgJ4weNLtbciOJWP7pPxMbQ2OkCMhpV2SN5jKXyC4HH9ONJV3SdtqpY52stvlqEjCrPDCgmA+Q3dsE+3v20/Nwy2NikjBwJNbmuBG4xkH3wRpdsfeOJ1BG13Aqv8ACzpKuppaVLJaaV0A9U9Msszkc5IVdxJyTx2zqsOrvAK3SpPHb6q72+mhPm09TUTzLFC2ckqksasTjjCNnj5avGe8QXy5QCOiuMNTDlHeajdFkUAZzLyCBngZxpzOqTx/81RxVKRSF42lmH4IC4yDj08DvwfnpMnepp0GFzhvrzwl6qjpGmt1yS7UdXUI7GkdRJFInpXhjwcbsndzlRzodu0T9S9SxTXyuudtghpFikFRSMsjJEu1hjkZAXGT7g9tdn9edOXzqW1V6dMVltoLvNMZFlqQjKgJXKNgHdllyWPzxxqC6p8Jr3cLFGHoI6u8VMlPmgiX0y84mkM20hRkE4LHgrzydRfY7SugcrOK7rcqyp6er6e03Aw2pcu8dXMJHkTcFVMqNp4HIUZwD7DQDUSgyxsiNMzA7u2FPYfp767cuHgtQ0Rq6dOmqSju6zPUQ03lu0ROzaULEAEAsDxlTg5PIGqF6w8HazpRaqGpjoBWyLHJHRrOHUtuwV84soHbO3OSAf0OCSLEVbHRqV/4b1kNB19YKypZ0ip65JJPJqPIZQDniUkbDx+bPGr3t9wtfVHjh1GJqVbjQVPSsE0vxU5lbI/EO5iPWcHBJ/fXO19tj11UJo0qKZfNaN1Z0HA49JOCTkge/wA/tJdJdZXuxXO918UbUz1Nn/lSs8fO0CNAGAORwAc+5++qMCx1eyTjYINJ9ZfHX3U9vsN9hp7Xa4KSmalR/wASmQyLmRt6ja20o23JI554Ixo58Mau30/h3errDUtTzx+fPFa7VE4eJTgbiBn3IC7TkAkkE865k6t67grZFkp2WSaCIo5bJVm8x2yD3xhwPbtq1+j+la66eHMN6nmVKKrWMPSRoA4iMkm1xjiQblYEZ4GD2xoHhpVmNDqMhNA7SWgrLn4gR11DPdKi5JDbia2hNYaWOMo2AIyQpJTKt6vfj73Z0zBcPDrwYoa2yV3m1TLDVPDNSyu4Vm2sGf3Uc5OeAfbVR+Dlu6XoL88d9uFta0tRxMrmQogmds7GUEtHgZ5bAPsdE926ro+ifGFIrFWGos0dD5gSGbz4gSUCbfUFO3Psc99UbvUMjbDVJi9fxJ3fo/qea1Xa0VVfFBCZGrbPQtNGWIJ7mXGcYGOf07aguof4nX6qS5WV7JVfy+ULujq6KSCVo96Z8uQvtL8kjsBjQvfbn/M66onkKU7SOsgijJTaC7OODz8jyTkkj203t1SqU8A83K+VGAA5mGT9ffBPf30qzhN9NxhQz7apcV18MbD1THHUUnV/xluaMf8Ay+oMC7m9h5iKGXtggq3v2POgO+9LWaru1ZTpYK2hVEb4irpVSookUAbZXkRw4RjuDKPy7M++qNv/AFHZqbqu9zVluoquZfNj3VUBkBIVfV+U5wOxGrT8G7nPcKWOn6cuCUFdbyrNR1cHm01UFABYYG5dpYEqeDv/AE1FNs3EKMqgFKB/X9I1rKKxeTcPhur6m3eWiJQva4XEZlPpHmkSklmzt3HOAD8tB1DbbiSJ7K98rpZBhzFcZXKEYw/AJAOfftz7amesvFem6Sv7ottslYazEiy0Eh/DZWZFdSAfV6SfUpPbjTSq/iZjr6cfF9OUswJikfMq+rblGUjZ2fOSck/IgcaavMB5F+Ji4HTNXiNXuH9/SSsvQPWolp6O4SrXVRVpfhWr6R5AMdzvxt5xx99ev0f1VbbNWTz2oWWOgpZJxcYUo1khKjJZXictk9uPY6GKOltV5tq3C1eFU9XSszNPW2+uLGBgxypUbQo2gHOORznvp30v4m9JdPWW721emrxm7UxpamoMYZvLySAhLHb37jvxnSr58patPHsB+sex9LgC34nPtIHzX6zbwiqprX0bX3G5NPSwS1EkSVpqfKpY8KhIYbh6iMcgZ7jOrFvPWFjutogtdgvaQSIPVB/MogXxg7hknccZ/MRkaBei/FDojomgNAlPfpLe292pqukSVCzKOeR8wPf2Pz0c23xH6S69ikmkkktoUGB/THSKd+S3+LPYYB9vbvpbJ1OVSW0ECO4ehwOoQZQW9/eOI+ob3cbTHWRdWLLUUzCBpgYpifRkBpRlFKj3PqO4+wGmds67tllqYkqfEesmaaTEtFRCQQq3OWJxySSQcEDHYY1PUydLWUx11uhqLtLI6wSw2mfzgSythmjDhccEZPIz8te1vStJeJJq+2R1EN6QDd8VbvU0ZP4owy7GJAyODgjPOcaCvWqebEbb7MZBsVJH99gMhrp19dEu1cZqxri7+XIrR12Y2GNw8vgYP5TkcjONEEfif1RQ2WlNZbUSckK9StQrswBGN27gqTxjIJ5z30IRVlfS1z09NQC51TyeXBUy2eOhMEZXAEm0hTwT34+nHCNin67joIKSmo7A1pmdxBHcKUyKFJJOTuGFyTgDPcan/KLN5KH5yp6NUX/ZZ9gF1/fZCzofrSOou9a9TbKa2+bGPMWBXLSke+0S+nOc9yM9tDFz6O8OprjUy1lmSWWSRpA/l1uSGOefxe/PONBtd0pdLxdJKE0PSNnr9rMJbdPUQbVUkbmxJtXIGQWHI++oV/CXreocm33MXKFeDMtW0XqxnGGOexBz7gjTy5mO5cCZzdOg2GIt7vqJ0HLDJI7bEkYZIwQc49sZ1pJBIWAWMsXOCWbAx9M/7adrfKSQqoYeY49II7n6a8W7QeZ6ZYw3sd+SM+/ufbX0refEyR6zRYanBDZwRwDwR9MDvrP5bPK4G/POdoHY8/PTyO6DCfiMMc7+wPH27ffWLXSzsVEkm0Nxhl/0Pb7aizINGaxWuXsZG2HtuXt99LR258HdMeORgHg61+LncgJIyJ89pwfke2vGeYxAfGAYxnaO57e41Xed5RxHBhljcYqfUMkZ404p52VsyVRce26Q8/Pj9dRkstfEHC1YkUgHYWHb55xryStrlVc4dhwNuCCdRUjXRhFHeIVBUneV+Z3Aacx3OCoXChFX5uMf20F/GVJADMcE43BFHIwPcc9/fWyV1WAxd2bAAA2A4Oce2qnGJIzkQ9Spp2GCsRA7kO2lvNpkIdlVGxjiZhz+2q/F/rYI1CoJT7DYOPqfpr1utapnLNTRuBx+Qg5/XVPBML/lqOZYKXKmiYDzjgY71GcD9tPYq2nfO2Ysf/7h/tqr6TruOR28yhAfPIBAb/z/AL6mIutaWJ9pgYMewCg5+QzobYD6S6davrtLMgmQFcbycf4ZQdOklLDAM+36sMfvqvI+sh5Y2U7jOBhVBP2wNPouq5m3EwSpgDAZCM6VbA3M0E63GdrhwJShwd4PvuOlBcUQnMZI+e7Gg2PqSQtu2uv3XAzp5HfTIR6gcjOeBnQjhI5jK9WvYwyp6pZkwFwwH+E99bRxQVMyQSRLEHbb5ynY69/cd+/voZpbnK0g2k47nkamYah5lTcvbnnacaUyYvWaODqbOxkfc0uXS8xs5gtU9IxaAI8PodWB5PPJweVPfJGdNKelr22+XVx2yO2ymGnpKMqRCm4FOAPT6f8ADyRkc8ckt7o6G9W2P4iPMxIjkA9OSOQwxyDkf00O1M1X01eIqSsZITOgdakpuXbkBlZhgqzZ9Jz7ZxxznMChm8jLkEbnpCnu1zu0Vx+OWluUSmrqmn5V0GEYqB6STzkf5QQBobvHRVus9+tthjgp7itRSO9IHpfPWQqAg3sfyKFGck/mAO45I0VVt6pLrNVUU4mpdg/5iqo2VJlXnI39yp9IzgYGSWHbStH1x1L07TTRWqMdbhHWKGCvqkpKinZl3hFmEZSVNoABBz99BKgG1jGo1Tb1Kpv3S3RNBcJKWutdvppmmZjFLEkUlQcBhsDgZYYA4we2qB8QvA2p/nNfc7BbL5daORIKmkmoWRonkclifUQyqAAPSDgkD666n6m/4n62Nqrqq1QQdSQ3QBLUXSZIacEMJVmVQFcEFSxGdpxg4zp/eLLX2y7U1vrLZT0/ToVUSmiRnmeTB5BB2mNT6sj1f+ngnVQ2k3UuyjIoBnz9rvDSvp4q83S2XJTQv8VUCmpyQVfBYyOw9IUkAAjOWPbvrzqLqm81HTVBY6SuQ2ugiao+DiwPLw5VeQPVJsYZx/6vkddeVnSI62tENmiu9ZBS0bM8lzChKqQiQNHAWJJYAZLE8Hjg6p/xM8GxN1cbjQUbUVO7pHPQUfpd3aJnJRV9K5wAcED6DOrDJdaovl6fTugNSpeiuum8Ma2trqq0pW3YxiOOnrYikcY9yy59eQR37DnRx0H1sl/qVvd5oaVWkiSCV49qb28xfUq8KrHaOeOM6G+qejr5fS7UfT5VJ5kpjUeU5crGvCMrLk8gZZeDjHbUn0B05PNdRaKy0vHJUU4iZYi9HFTiPu4YrkSE7uDkHk45GrsoZSRA4yytRhp4qxXGxV8P8rRLnBUTxw+pNsykLzvUkFSSTjOexPvqMtcV/opKdXs7xwSooVomVRwOxBb5Dt7DTrxQ8WbjX9Q0AuFIKeyRPHU0sixHzCpBCkg4yG2ZBwM59++lrh4j9L0N2gr6e/T3aSSmVRDa7RKXyNyqJfMkCoxLchS3tzrlTGyV3nF8i5L7Stb5RdWpNcK+G3V3ks07JKsKvFkyhYvVjHbnvrorwNe/9LdA3K7JTzi4C8z06W5aNPi54T5axNErLg7cs59mAweBp94PWbobxq6JpITDP8fQeZLUV0IejkZmkJCMA2HGADnPGDgjGj/qumvsNKBdqGquVJSK7R3KlqDOYvSQWCEBgcZB5H30rkqqUbx3ED95m5nFni5DJBdqYNRxUlwSBTPAWOPNLyMx+mc5x2BOPbVeQS1EzqssSiLOCS/tn/fXX3UX8PVJ4hJdL/duqJkvIiEqxvF5SGPy8xI7SAtGTtIHDA47++qp6M8CKDrMW6ioOpKZq2plzICMsAAAVUlgrEFgcen20yMyIvnNRVunyZGOgXDXw0vlvs3hBeaeJ5YLiLXPWFJNjRy7oiBIOcgAjGcEE5+2qetXhn1feYVlo+nblPC67llMEkasPZgSRkfUa6Mqv4e4qToujp6itrIrzFSzUUVwdoY6UU8rEEsFfJUKPc+5IzjVZdWdOVfgVZaWvtlfKLzA4qJLxaawvSx7mIWLy+QQVCtuOFJPv7ZynS7sp3Y+n/JrtXhIHGyjsf8AsC6nwu62pUE0nTlw2RKXLBXbYACc8Nj/AMP015c+v6Lpnw1m6PuFAlwus13juMlSZo5o1hEWFTejE7gxJI9s888aKJ/4tuu3tktsu9LSzCZXi+JqKXDvvXIJAwh4PupBxoWs/ibbWutJb7r0VY1Epj/5l6AwTRqR6pUxjc2BkZBGdFXxfxrfu/7FnfA1LjYi+bH8Q16XMKeD9LfrW1RR1ldempy9DMysqJGMBkDcgsWAOO5POoat63vtPtVOpLnAW9Kx4LclmAHJ+mNT/U1SlNbZarpaGS4WV4xB/MKaiSN6Zu7Z2bSHUt+baO/J50KdM9FXvruG8V9DUyXP4EwxLNchiQSO+1VQqWUqeclj2H20uAmT/Y4r38/MR4u+GsWJifdx8jJig8Sb/EjbuqKyc+hcvCBlmcgH9QNv6Z1Z3Q3jD1LYbLZ6VCt2mvl0qKOKeuWIQhotgMZyQw5ON5ODkY99MK7o3fBb5Z7T09U0JnSOOoMY/wClGMOQ271SK24BfYcnvpGyWq6SX7pOqpqC10tJZ6mdntEMe4VBkl9e0DcTmNd5k2kA8e2gYxhDlkr5fQQ2XJ1D4wjk1t3P1Mt+vSF7tcKe8dPW/wCPWlSeX4NjT+SC3lthSMFtyYxu0FdQ+DnUDXWZrb1ZaKajblKe5SDzYR/9vOfUF7ZwO2svlBJ1b451i1FH5VDBSN/82gfcYyYVLwMucEZnb8y+/wBNSd9sniTZa80Vl6hvtVQQoqoXhgcpxnZnHIGRj6Y04oVmLXFvEyIoVbg67RRyMioSAN/zz/T9e+sEiSIR/wBSTvz6OD88cnj6DTOaphVmJqWw5AIp4zIftxx9edaQ1CGP8SLbE535yu7744Pbvr6lU+F6o9FYsSb1YEryu3cQcd+3Yfpr3+ZNgvHLEVPJGcY98FT7+3OmkdS21B+EN4CRCd85H0OP29tIz2+SmLNJUxEN2fyRx27EEdvnj31FTiY+ku0sKlC6kYJ2GThQffHcAaZLeNq7t0TyjIV5GOQf6H+mkJaPEuJX82N87FUEhvmeOc6TlnXYQKZ2iQkkhtg7+47/AKc6kLBl/WPp+o5413NUFA3DNCSSpx9wP760PUU6R5+JmlIJYMD6hx3JB/00zkj+NYRh4MFc5B/w+3tzj7a0qIAkUiNUeX5agBiuSRjn6jXUJUkyQfqOvkAMhIU8Au5Ynj2/11kl+ki9JdwCByjtjP8AtqIjVEKoCFjlJO4sFLfTOM/rjnSch8iMKDub8zMykqRk49X+nGp0wZNQkpmqa0uoYk/l3LIQTk4/UH7afi1bnaN2kkZeCgAGP1P+w0J0tRVGZWo98yMxAzhV/f599FFptF2wJKmojgdiSoLNuHHGcfbVTtK6tXaKNbYiMvJPj/EvmAbftxntnT2ipqNcbI2Dd97k4Hy4zp/R2utELk1iMTyfws8/fOf01L0VvkZ0Pl+YcfmaEqMaEzbQqISeJGR2+pqmcQsoXg5K8Z/XUvaaC9oQYa4RrnG0+r9caIqGxxNHGZIxkflPPB/01JU1BFGSF/MvYgnjSb5RxNPH0x+8f1jG3w3bjznjkXvlSdSCw1RTAp4pPkc4zpxDRbhlCVBORt5zp5Bb2X8xOT7HJxpRnmmmE1W8Z0sNcJf/ANnHjvlcZ/vqWhkqARvgdQPkQdKw0sqgDzM/+o/+dtSEMDEelfb30q73NDDhK9zEYqiWOQOPMjMZBGFzqYu9vpeoLdLcY3BmTBqaaVdy5BA4H/n30yWI4wGI9xk6TELROGcs+47iVcjJ7c/MY9jpVxq4mriYod4I3UiygUIqJolqoJlikUEeSvLFTIc45PpyD7jUhYbnAk0dO0Us9Q1OM1SQM25d52KzYG5lOR27bT88kdK0L/GI1NDsYFgAd5BIw2c+3bjVe3e4XGwRVstPEaqeCRnt0SOwEqjbje+MDhsYJGdo1m5FKmxNzFkDijD631LUMVUZKyBH3qZDVTMSyAgMVHBxjIBxyf01JMEpqBI5oFqzIgV42LSR9uNpIzntjOPuNCqVFvjqaKaokipiHJL1ErEqrkHELDG3LiPIPGOx0V0VQ0lPGkieXIMiQyLsB4yWUAYYZPtjOoG4knYyiuq+l7vXTi72jpStpr+xkjlUxqcwjhG37/UcE8HLD540wn6H62qaqG40vTc1LXoFm88y7WZguAChlwwwxU/T99X5ZK+graz4neVrY1CTU4lDvAf8rBSQD/fU890oIXghaR98udpMbewzknGBpJ8Tlr1H8o9jzIFrSD75z/Z+kOqOuun54rvutFdTz/hSxgjZgYYEuSrk5IwAQO5btqErrDXU1VLZ3onSoRQW+LnWVJEJKl8dwcc8Ad+O2ukLxNSwhKiOpjV3dY9khwJCeAAfZs9vn20D9Z3Hp++pV2f4mmmu7wmOOKCZXlcsoG0hMsoySCTjGCR7aICQNpSwTvOVPE/oWns1DPeY+mpamOWMxTvQRAyJGpc5K9wM7Mkg8LgYGqWuPTkUtVLcLLM0q+ZKI6ZSGcFXjQEY4538Y479gNde2zp2/wBlkrp7nSGjr2qECUzTvJD5Kx7CyZ45JOBjtjPOh64eGFk6gpVjqakW2enWNBLAgkUEuJJtqcBHZgACc5BGRqfE7H4yj9PqGpfhKa8K/HSPw6nqqyrtIqb3EgjpJY/wYGyoRopYkwpwqkh/zbmznGddUdAeJlt6ivpraXqXp+amqKeJpLMlwKSxEttZlLoA2ATlMggr751y/X9AUiILT1KaW2/Diiha5JFI3lsYHYB0QYbk4LfTjOq5uXSBorGlU0ipG9NHJTnc5eZHdhuXHGMdwTnnP3lgeYqGZNjO5em+p7H19ert5bVFquk8ksD0kshUSQxOUVnhY9uSMjjnjsdQ1X4E01ouEl4t9wobGhJgbZLFFDub0kcr6GYccEH5Y1yv4P8AWNYnXNnarlo4bNbIpo5fiadAppzxMisF3tvGQec5YnIzrpLwY8d7PW37rGkv14orjZ6usUW78LfHS0+WAjlGMjsOTkDbyV1U4VBrVcZw9Q7JqIA3rkE+/wBflCGgvE3TNbYrLU0a3dKmSKFqOlZbhF5SRSqxUg8YMintwA2dQU/g70l19XdVw2Uv0nXW+tWmqpHg3U7uApjQxuT6BkgFcAsCQBwNHvU3T9hs9fHRWSez01xu8ctVTQVkZkFUScExMXAJzg7d2OOOM6rWWt6h6JoquDqCozeGkinKLGtPDPHG4ZWPfdtUYALMuGONvGoBCHcwxXWNSQC6h/h3SlkeoktEcPTqATVN2t1Y1UVUlsiMIDj04bDoOQecayz+CdR4bWqi8QqWamuVVNPBDDJUW8V1LHSSDb5phOCzZ24dGzhj6RjV0eEnic9xFdSXC7GnvVYzTU8qqBTMjArGiMGKqQGVijADOcZ1IdMW4dX9LUlXdqd7XV07oVlp2MaKdyrGWi5V8EBlJBx7Y1Rs4Ure1yq9NqDMDx9Zz7VeKt26ciuctP0Xb47VNWGKWrpCnk75Zh61C4/MiABcDkHI76YX7+Ji1S1ri09N09NDE+yWs3ulS+GyBkEH253E++ANdPXToqIWaouFdaqHquety3xlHZ4GaVN25HMLuAzDb+bDH6+2qJuHRPQF3Hlf8IXKmgYyK1Ra6c01VvJOWMUjPExBBAxs4OgeDju2hPFzlaQ1Xs3j3pe827rK1UN8t9pWurVq3op6W4Uyf8t5g4mDgZKkADcwODu5POqpm/iJorWnw1RYWlEDOgJlUYG4jsE/840aWbw+oPDnw3uN+svVFQLjMwguFlvNSKeYQBzsKmICQMQc4TIyeSBqg3NNPeHLW2IUQBPlu7KwYgnIO7Ldx78++qnp8JJVxqHv/mOjrsvTY0KNpY82PnxxCbrfx3a90doHTdNVdOXGkmkL1tLWEO6YAVMAADa2TkfPQTQ9W9UusslNfrhEJJC7/jyZdzjLEgHJPz05q7dZbhTQyx05o5dxT1zu2cDlwGAAz7KDgaKelqS30NrCUV9kgiLbmT+V+fhsDOW85eeO2NaGLwUUIBQHrMjPny5chdmsnuNvltLfFY6ENFsqkDbWkhI4YexJIz9hnTZLlFWKzNIGmT/ACzMfbjA41tE3mzMFUbGJZVZS7A/PPbWTVUESx7pZymcbU9LfXcFGc8+x19O4nw8tZiy3OSIRvS0wjdztLFCd5+WRzrJrzIIo99PICDgSyEgDjsQBn2z78aSjeCFFnpowuAcyEhnAJ98gke/vpCAU11cvTzBipIJaMseAMnPA/fXVI1Gqjxbk1cJFWXzSnBK5wrH2/bWlTVrBUNGU83jDFj6Ae/YZ4/3GtalIYywZJalUjwWUhSvGewye+M9u2sBp69sgq1OiDjyfNYcdvzE9/p21AlSfjPFqxJEA0UlQjgAFFKqO3bjWQ1bKV3t5EiLho4gHXHtuPf8ATSiwRrTM8Ui+ezeo5IUH6LwT7fbOtBS04yUnaSWNTu2gAL8xg5Pf6nXCpBu9olIEO7zQ7PwFDAFO3PyxpGmdIpEjmBihP5QF3EnGc/fnS8dKWlTfE1Q2AAWG0du5z2A40xaOMy1D07u2FIzAo2E55weT/TUwLGt4V2m72eGURF5abDbeWBOAO/Pb3+ui+1Vtk5ijq5GI43BN6/qx4zqtrP0LVXw+etRFSY9TO4aVs/uNvGP7aO7R4T04K/EXOarfGSAUjXPtwAT++gPpHJh8XiNuqw5tslrJG2rQtySpb+pHbRLbqW2sFxJG/GAA/J+uNClr6ApKQBwGdxxvaR2z9e4H9NENJ05JSxlV3AFu6gEkfc6zchU8NPQYBkFakEnYLfASDzj2Jbvpaa0RzudkgGRzhuNIUluMa/kP2ds6VeF8gIMsBnjudIkm+ZsADTusdR0O0DDDHvjvpzDRoD3J47HUUsVTIc5K89jnjUpSRyoPVIQPkPfQ2BHeGxkH8MdrFsAIIOOONLxliPX3+2tUK/lLbRpWJkxgEPzxzpcx5aETMbKdwbK/bJGtTvIK/wCH6/PTzI29j9M68yGHPfVYSozpqme1upp4KZkLAP8AEliAuRnAH09vnjWt9jkp6mQW6YNTyYZN6hmwe4xxz7c/TTl4iR+VhkcnGdQzPIlYSzkKh747DVGUNGMbldoI0lRVSWwUvUNOgNZGPwJEPG4ZMbnJzg/bOp623NqOsipKVFoVEaR0xQ7wwDEuvlcAfPJPvqQ6zvUlutddU0NQXghiSRkRC7BcgP6fcgHI9uOdDEV1qGq0iiM1YZXcJcUCiFSmMM3JIByQOPY9sjWWbxtQmytZFuF1GiVgont2+3pTsPiaYxlt8bq3o3cMG5Vie4wBqYF02V8dJDvrEyY5GiUkU5UZ/EbOBkYAHcn9dRdBPSW56q51dN8DM9OJKypD5jbaAMkAnkexxnHGmUaXPyoqG4N51MC1SbrGfh2i9WY1CklmZceonAKn76KIMwwmhjqYWjlCyofzB1yD79tMqGy222VrVNNRRU8hXaxhXYGB+YHB/XTbzq2ipqNZalLjLJIqvPFGIhsIJLADcDzj99OauvgoqI1FU60sYKhzK2ApLBRz9SVH6jViAZUWIvebFSX6heKdRtHqUqfUjfMaonqnpmo6OvbUxkAe5TNIshgzHJhRnJAwpwp79yffjV5UNx8+eogWKSOSJtpEylN31Un8w9sjW90oorjRtDWIksbcsrDI0q6A8RrFlKbHiczQPbL/AE9PdIaHEg3eXLJTqkqghlIO4ZK8n0ng99VHU9E37pu2VUFLR+fbHW3UBpgskyVI3DeYmEf4Tlj+X6nBYjV09fdOVfT96aOmuNdFTvL8PSSNR+YheVQfU5ADbME7jwM47jGlqiz0dzgaiub/APLSbVIUsgk9uCpBB+WNADNjNdjHHVMyk9xOQ7rb0tDfFWaueGnlqJopoJSyzw4c5VlxuwSgOSDz+uhqlopluVAkEkfxDSSmUz7o4yoGWV+xxwQf299dH9R+E9p22O726+25mkr5nF3nkqB+G4kdBO6sQyl32BsZ+ZIzqoaLpeLqu+WailWKnq5KOSpY1DusVRliy+XlMnIbjGSSDjtpkbiwZkOlHcQ68Nqdet6unjp6qgvE9tYVEVrmqvKhmXb6hFEADC65OGQ4JwCM86sK1eNN2tF+r+nLxSpcbBWVbxpR34yJVUkDeWpkEmDuALuAV59PI5GuX5axOl/gooLdNb66mmmjNfBVMBJIHI3g8bSoyu3jvznRD4f9T1VVeaioutZPcqiupvKT46QyS/FBWwcuffK+okAcDJONL+GxcsxGnt6g+8doyudRjGMAhjz3BHuPf2zt2m6T6e6kt8T2QV0yiJQaN6/ynYbQQF9BDcEcZz8xnjUfYLdTdPiGiIukSKY4pamvuT1VRHGjF1Vdyjs5B59lxpert9PF0v8AH2ipWOSjjemEdPIGjd4I5AN3PGGYn2ycc6kOkr4vVV0p+m75BK9Z8FLWpNPzPDEszRIN/wD9Q5XODzgjvq1ahUqyFDePaFFHVJTM9bH5l4Z4oKETUKjdGgZmMskRPp9cj5Ke23jjTa5dKWjqq2fD3SoqbhT7FkZ6SsZZYSRuBV19Y7dmJH9tbL0DVWqamlpr1HH5v/TlSFip4z3B4/XvqN6p6Y6opepbVXWWw2241x9E16eU0/w3dcyRZ/GUK7tt55xjHcBfCz8cw+HqCv3xKh6/6GqDWxrabhV9Q0dVTGoonukoZJPQGCE5yGO5cZUA98g6GovCLo++rFFdOlqy13en2lbva5GlSdsKxLxNxIuWIBHce51J9a+JXiN4RX1/55bbZU0VZKZKaogU+pNxCIrFBjauAAwyAByeDpOzeOFNdukrbb6uOq/m9v2PSzOBJHG43Ki7QmCnK8ZzlRzkaXQ5MRIyCgfSa2Q4eoQaWJI5v6bQF6v/AIWzU9OR3e2vc7/dDWsJKGlEUCmnVyAfLJEgdgPyr/m55GtOmv4QOs+orBQ3S0UFDS0lXH5hpLhM8U9O+SGRlO4+2Rk5wRwNGtF1X/Ibhb6q29QvJWrTtRT08tIPKp2MzyyPsOwjJKjAdjxnRPTeBU3iGZuoYeqizV0hkl+AoqqKMSYAbKq5G7I5OTk8506rqx0hvnMV8IG+kynZ6yqebdVVFVLFn0BX2KAe3p9P2762ZZlj30rxUVMTklBsdvpnnd/20we+eQuYk9YIwHZCwA9+Mkdzga8kuktUvnGeISc81O8RkfIE8fTtr6l7p8RPO8kzJA0eyV5q+YerzmbaifIdsZ/QaRkuUUkQkKLDGGzuUAOTjvgZ49s41GqpETSO7TuBuWMsUgye57cj24znGtIRPIxDzmMA4McNOwBJPfOQcffUWeJUhQbkzFcEkg+JjMm73BXCkZ7ZP299atd6vzUMhgjGMYM+8gg5HY4/Ye2o2ps6B/xw0jkZUTS59I7YQMB++kZqqoSCWJY1cjny4UCFfux4/bOp3lDpkz/MZJnKRSeec7WMWZADg4G3sukt0oQkysX8vhJHwByDggDGcfTUWK+OSBVqHDMvAiWTJb9FBGdLNUNSlxSj4UAFd2MfPgkZ4/bUgwTAckxyWJeRPMk+Hb3Kkgj6hxj/APydEVluVJQsI4KVFRO1QwJHb6dvvxoPSSLBl3ySVAOPN3tj74yffXheNS2VBDDKmIl/6qeAfr7asN+Yu2xtTLNoet0gD7aeOeMd5zL5mT8woJ/vopovECko4sq5+Iwd6tEVOfoOT8vfVFC4TOUSnZ4GQ8ME9JPy9IHP6am6GeqeMg4VG4M8nrOBye/fVTiVuYIdVmxnyy8KLxOaoIREMZzn1RGMfu2iOLrY4XcDlv8AC7d/+2qAoLpRyOBBM0205/EEiqfmTu4J99TVmv1PPUNHTzyzzZywp1IU/wC/76A/TIRsI1i+0842JnQFB1QrohlGxiD6F5zqTjv0blSW29u3fGq46aq4CPLd0pyRgKeGPOieJAQApyx5BLYB+nGsrJiVTPU9P1WV1BJhF/NqY8ltwJ/MTga9/ntMgXDkY0NzUjFvXEHx3wTj99NfhBLGF2+UDxnBJ0LwlMa/yci7AQtiv0UgyZF5x3BGpGmusRIHmKxPyz/bGganjVHCRY75G7/bU1FQSIVYqpx/i5A0N8aw2LqMhhaler++fqO2tvjQCfTu+WNDsKlnXfngf4DjB06EzBMFgwz2C40qVE01zEizJZqxGONxQ9869hppbhbrmEWSedSjRiHOSg/PlffnQzI0w/EK+SRnKo279dTXQ1wCX01LvN5gi8n1vhWXdnGOx7nVXShYhcGbW+kiRqW1rhEY085C2VchScj5YGgm+WC10FxkttRcJbeonRoHJaN1lIKgRsxI9zxgHjVj9ZRpb7tVxQzSLG7Ert9GzcPvnj7arOOzSzdRz2+oqUkU0oeOqdN06SAcOuRjOM8/IkayuoNkT0XTDSDcL7a13obtTwPLPcKGam8tY2iB3PFg7pJNpC7wecLyR3GMklr66mms1xFW5dKbctWkKhmQ7QTGAR6uGAB9/vxoWtlRWzdTpVyUFTTUlFHNTs7zg+cMIyyRxL3LNvXHB4+uiG0225XO8m51zyUFA8bJ/KmZH35CbXdlAxjDekk/m+mqg2JciuY2oJY4Ol4Z6KSeaspaRadJRKvmQg4P4iMQAw4JBX27e2jGWKNoSkiiVCOQygg457HQffukai/XamqbXVtZJKeWTzqiNHikl3RlQVZThuSPzKe3BGdEkUVXb7JTwsTcauKFYXmJ2h2CY3HPzIz+urjYSjbmeSs9QfLjR41qI2Vp4v8AqRfIggEZ5/f56ex28rFF5lPM2Bw8oJJ+vbvqnuo/ELqentz09V0D1OATnfahEeARgAxy7jknvgfbk6jbd13Nfppbd1B0j1zT0FaS9R5tDP5akYAAdH9K8AnBAPJ99VIvcSwIBqWTf+qLHFPVW+tqKedmZESlpD500hI940yRgjgkYGM6pq53cUXWhsV2oKi2/EgT2ipq4hGKwAHeowSBIp7p3IORxq6+iPDzp7oITpYbetIali8jl2kdvoWYk47+/vrPEPw5t3iP05UWi7o8kUmGjliO2WnlB9Esbd1dT2P6didAdQeRD43ZeDKZNvNCm2mKoyjaBkgMvy/roF6g8NKO40lrji/mUNut8E7CGidRNTkkEFSFJZQEIww9+fnqZtfUknTl1PS3VtdEa9E82guy+mC7U3tMp7K69nX2Iz21rc+s6GrgSWxPT3qoSqhp5/hp1xFHIzKZGJ4IG08e+lAHxmxxNG8edaPw7zm+mttUj9LJeqWaajq6Kaanqlijk80HACPg5DKzEMTzyM540/8AC4t4fyQ9SSwRyz0s84RHwAo3SRgnIbzFGclQR278DV737w2tHVd7oKuvoayvpbfR1Cva4qo4dmbzCwDkbQWAzg98n5a58kslX0p0zZ5qmkWroK2BagpDUsZqSV2bEU24ejsRjA3YJHYgNq6OtjmZWTC+Ft+J1PWfxAdF3bpKO3XWjpKSrrqdoqmC1zr5LLIFMjp24IDnBG704BO4Zj+oLpS+Ic1F1D4f9QU99rLfBTQXTp2VfhqqdI5vOElKzlSHLZ9JJDcDvxrk6+UyLf3oEt1HLwZZKihldkGQPRkAAEE88fmPtnTXoulqZq+cQVNHLW00MsqpPOEaMrl29wwZioIKnj3znQ00g+Y16/8AIPJlyafKt+m9fPf9J9IenL4vUV2gReoqW23SihWOsttQV/FBJDBlHpdNwIDr+UhlPPGhnqzo6luF/Sppay42csY6WKmhuhWgl2sd4hYZVJiXACyEBsLgjBxyR/8AFA37ptB/Nayhu6bUgekQIykDBYuzHcJMsrbdp9KFt2OEugf4ieqqCtFj86mqVrcR1P8ANFY04BAUSP3KkDB4ByRnvjUX5jX99sKMnlAP99k6O6ip7HRzS0vVdP1ZM8TYo4bkqmOZQh/PtfDAM7DAORqgOs/D6kprbUGwtJZ5qyrAVKcSGnR2kxGqoSzoCCASCRnkADjXQfhD4wweIfT96hvFJS3Sgo7pDQ0dtpIJJyyMnDJ5nrOCrMd2AFB5GNWSnhr0dSRXK61VJFW0JmEstNVUglFFgDCqqoGQcbud30Opo2DtUmiRS9582Zh1vYrfNXNTTm1oxiW4U+0xBjkJiUd8kZ5xnGjXob+LTxF8OOn0s9sNuMIkeaQ1tGZ5C7Nk5bcABjHAH99dsq/Q1FHdIrLcqGKO6NG09LWUsr0xCrtCrGEAwRng55OdVT1H/DD4OdTXee4Ud9rrPDKeaS3z4hU552rJGxUfTOB7Y1bVivcAS46fqFogE/GUrEslEEdoKSB3ycQ4LAj39R7c860rB57gVfmSoeRg8N9S3A7aQephSQRGmEhwSMjdu5+QJI1oKGeeQROKWlgYnlpAGU+2Ma+oHafB9dx3T1MKU6rHQhYw5AM+MDjurYPftpOOuZpVVZ2TjaEG9v0XAA/pr2phobZvWNgKhM5DSGXDD2GASc/InSX8yrK+MRR0rRxHAwqABz/6vvj++qjaQxPaOKiOZQORTRYwZJSQzcfJRk5+p0mrU4k2tVsy8FTGmD+vH9zpi8cdHMWqZ4qWRvYSmRh98Z/prwzUT1SsomuBT88rKefr24H3+WpuDN9xF3uyhiEVXRu7kknGfYgDB06ZX2uI45ZllBJgVsEfY86QqZWchxNHA24oItoX98H++mkjmqYqrCnBPLsQufoNvP8AXU3UpuY9MURPlMYaNk4aPO9j/wB9KtVxRMyxoQcZ85lXg/oMjOo9aQLgMXddxzIxIVlx7A8HSkU0EaKjmIEDbtgOSn14GP6a7VU7QWj6juTtGo8tJlPKopzgZPv/AL9tEVNFNNTZyZUUBgkswOD8wAOT7c8aG6I+SD8KBKwUFkqvyrz7ZBz+2lo7vGgEkk0pkyRtDFQfoBkZA/pxrg8qcJJ2hOsMNTCr1VTPPFjiJT+Ep4/Mff7DPfTulu5p2jhp4pJY3O3JkAUfoP8A21X/APOaeSpcr5kCABd6ADf9OATn6nTyC81CPinAWLgNsfbu+hJP6/pqviCScDCu0s+guyUhCpubsG8td36H+nOjy019XHGkiu8Z+Tv/AKDtqkLV1bLT/iF45ULDADBd/wBxndj6nR1Zup5S8cxaBlHHlyjt+2guAw2ENjZsbbmXXa7mKqBRJ6/mytx+2n7UkEhU+ZnHPJ/vqv7b1pC6LuaIt7LGh/vqWh6jWQB5InjGc7o2BH65xrMbE17T0WPq8ZUAm4YUlIMgsQwHHHGpRIYzwwOM8j5aFKO/UnpHxC7yBy3fUnSV7ySF0qEqEzjnII+mdKujTSw58fAhDTxAMFBTb2wew0+Wmp9mPc+68DUPDM8gHAwOcHTmOcu+QOB7j56VYGaqOvpHBscUswcuzr3Kg868orDFb62OcMzbCWVdxGD8+O+kXq2jA2kn7c6UgrJZFQr+IjeoMp4I9jqh1VDJoDWBvJm6Utuv0qCvhkMyKI1qYiQwA+Y7H/znVT3ugS1eJC0nxktSqruR5UCDBXO0D3H11adLVOEGxGMgPGedUf1JfZF8T5qqTcVSoWHkH0qQBznH1P7ayuoAAE9D07E3LFs0lZLUM1dDDBTow+HZZRIW57kY44AI/wC2pO53q41jiksrxxB1x/MJIGliVskEDaCCRt5z2yNIhd1LJGXVAFIJVfUM9sH9e+oqz9TT2m9VVqprVVXKihSNUioUjR0djlnJdhuQA+w77uSeNCB07Rmi1sO0NLNfqG8W4VFLXw16RALNNF6VDAZOQeV+ePbOo2/WCDqmttNSs7y0lLK0xemuEsOWH5RiMgOAc5DZ9x76kbxVUNFQvLcpoIoBld1VJsQ8cjJPP20lS26spqGijhqaeDygzSrDTIscpJJHpB9I5zx3POdHvtAAULkuGVzhQcg98EHSVZHTTxmnnMTCYFBE7D8QY5GD3401hvME11ntgMhq4IkmcmFlTBOOHIwT24B9/vhWppKeomgnkp4JaiEkxSNGrPGcYJUkZU8kcatdiV3E8qqmooGganpPi8uocJKqbEPdgD3x8hqUqzwCFL5GcqeRqCjoY47zPcAcSy06wMCPzbWYrjn/ANR1I0ks8zlXQLCqg7s5JOgOYZR3lX+NnhTReJHTdRHWy/B1sGJaKtCc0co4Vlx3Ujhh/iXjjGqA8MKodNSV1ju9ElF1QlZHBVU9ONsbRMHeGePnBjO5zuGB6ueddrzR8HABYH/EMce+qG8ffCuW+Wym6o6daCDqS1EyUlVuXy3jY5eCTI9UTnJySdrHI47LFQoKn7p+R9f3jKudQdfvD5j0/aRE98s9vrKaluLotXU5WDdKoMw/LtCk8nOMD/FnHyOtLxYOkr707fIKq2OlRVxGMVFMq7oXK7UJ+YBOQT8/YjJGulbpZPFRIK007w3u1bDPTSqC9LMeSgJHOGB5H00RV3/IzGUtsk7Fs/mB7nHv9R+ugMWxHSRuI6mNc15FPlPaULePCWwdF9TNSipqrjbY7bHJVVTqyiGWWodVY7c7BiPHBPf9NV5S9M2VulLnX0cSyTwVjQxCaFvPaPON5YNtxkYK/Mj2Oukb7Fcorlcbv05BQSy1dKtPcqaoMcafDqxbHlsCGUFs5XByck5Gue6jpnqG3+GK3iGqoZbZUU8ktXTvlKijkMjEBlJJ5wMN79jg92UrKLJozNzYzhbYWJlk6OrbpYaC40dZSvFWR7nWRgs0agcgJwDngAE5JIUfmGQuj6Tu/UNrkv8Ab6eU00E22ZjJ5ZWXdjgEHO30kgZwCM6sewGem8PVuVK8FVGlIol8pz+AwjH51Pb8oPfBIyO2NQdXd7paujrbRQuaejoZo6umq4FIDMQUl5IBLYZc/YHnjXFRiO3NxctqXfiTnSvRvidZkahoLXUU1wglF9IpdgmlAAjVopYyQ/oDYTIzhgOeNXN4TfxVQz2+63XrNaqnu9IzRUdbbZHd5Mlj5BgbCx4C4JfhvfnJ1Xfh71x1f0dDHcen4qzqGJqcS1tOluapWDym/EZJFkG7AZS6sQMycDjdqzpKXpXxavsPUI6MnuNxkg+HvMlod1ljVlwXqKTKszDgqwZtwJALHGiKdQ8wlgQoFGWhaP8Ag3xwpaSopA3S/VDolS9G+AKpWVXz6CQ/Huh454xoI6q8JOtLNeqiC39F1VwpGYyRy0VegjUMxIUbueBqb6dtls6e6a6fgr623CvoaUJR3u2hpFnm2mJImyMofSMg4KlsHBB1r1X/ABL9bdJXh7TD09JUPTIiTNVBN4lx6hkdwD2PuOdUfCjb1H8XXZ8QoNOXaaQIGaRmwOSQGZ2PsBle3b/XTSovCJLtPnyArj8f0j7EEc6amQwyEwJJVSsAC7HBXP09uf8AvrfMdHGXmkCSEkmSZyw3H2xnn5cca+mXPz8Vsz2nqhDJ5qshZhncsXmBfke+PtxpWeoqLk2Xn8xcbCxlAwPkF+ny4Go/+YeezNFM+F7R7QFz8shR/XW06T1IUTTJArKCexOM5z3HP0xnUapOg94otVRxzeVHskAJ9UmCgx7hQeM/PSv83EqpFAsaRhedxCr+wPB/rz30zp6VCX2PUVRJ2mfAVFPvgccfM/11IM9Pb0RDJGZnGAqKCX+hOCf2+euBPJkkC6AuaRQCdxNVSxNkgmPBIP0yTgHjvxpw9VClOkKIJZVJDSOuB8xt3H6jsNMJJooVJekSkDnAWN2LH58fL76THmuVjhilDyHO0qNrAZ+nH6arq9JIxm95JGGSpAabCYx6XfIX9zx9tIzV1NSkxHLuF3cqCcn5aTa0VESKaqoFODyIkALtx34GSP10vSQQpKfhId8jlsPO5B4HJyOePlzqm8N5R3ua08tRWQoEid4yO8UWAMff2+us+H8xDHJKIjkHCk4798/TT+WlrKqBRU1M7QjB8qNSI/1Gef11IwCnpUDyrIWXhF7sxHsOM/fVtPrBnMPwxjS24swZzvDAHen4rEdxkEcacJCNx3U+yME5lqgU3fQDHA+w1NxEpAWenSmi3ZwzHLEj3JJz+mNZJN5alY44l2/4o1MgB7454X/zOp01AnIWMbUtugSdZuICQD50ylY/rgMO2peSBtv4dfGm0ZV3YMD9QvGoSOqinnQyBpJP8xwT+mB/udOEpGqQGkVVj9t7lk+3IHOpHsgHb1knQ10EEy+Ur11QvcgkJn9+f306ivN1qSVaby1zjyxwF5/XUVT0QoxEm50YjJSP0J9+dO6Caeqdo2SIxp3IQ5z9Txz+v6auBEsj1tDbp6ut9ECtVUGSVuHTOCM++QcDVkWhqSoVXSQtDnPD4A+2qbt1NFCSBSKC54ckMB9cd9GFsqpg4IklCgcK6kAHGB9B9tLZF1bxnps5TykbS2bfVwxnEEjkjHpZsj99TkFdKwBdY+3dWzquLPVyM0ayfiEf5V4A0a231KHJJUdwR31k5Uqex6LqC4oSX855clFBQc5zj+mtrfVSbvLWL0r6QFB/YfTTemmTnYApJ5B4wflp9SMu4lWGe24HSbTfxHURvHdLNJ56o6TBSRxG39/lqs/G+gp4evo1px8P+BCxEY3ncc+tse/A/YatWnoRX1UEQZ1kkkC+k54PfVM9dXitr+tquvg3IizssIX8QIIwyjIHt6cn7nWP1R2AnpukUyxIDHBb8GVMtGMtI20E4zxnt21F9Q2GnvUVE0kE0Qhm85aqlJXZIuGiLquHddw7AgfvxH2i+Wzq6WWnkepkuFtNLJIsWUilZ4xIrrjkpyc9u2Dx3Ia+3r1Aa+01ieXAI0+HqFQ70kdH3becFtp45OOc4yMr2bjwAG5kzb+qrTDcIbDU3SiF7SPc1GpZSVGOVD8keoc5OSdJdadTN0wpnRo/womqZkneTBiQgPtCoct6hgdz+mkrdT0tvej+PpaSStJSlgrJ6YJPOEUsqgEElhsJ/N9RjT3pzqG4dRrc1qLLcLCsE/lwNcoghqEKg+YqhuMHIwfkD76NZI9sEQA1EbR7Yep7X1RaUuNrrBVUp5JGUKnGdrBsFDj2OP21EdIfjXK5VApaem3ScNBOrtOHw29lUkA9h3+Z1MPPFLWNT0lbTrXLjzIpPWwHGfSCMHHv9dN06lpZ5WFNRVlQwrWoJJI6VgqOp9RLHHpGfzdjqb3FyAKBAk1KhyTjcCcc/wBtRUfTYPU8d2NxrBhSpoyw8k+kr2xkYzng99K9QXGrtVE1RRWmpvM24A09NLGkmM8kbyoOPuNKQSVNZRxzy0z08zLuMEjKXU/LIOM/XOuIuVBK8TW99V0FBSsWmWZ5C0aRRDe7t2Khe5Of00FX2z9SdVW945Gey0rU52UEWPPYgZUuQMIOMbR3+x4Lel+nqahqq6aCj8mqqJmld5H3MxOMsG9iffGiqKmELMjn1ufUw55+h0Fl1CFVtM4eofCrq3o7puj69LVVT1ihcXK1T0xjlraQ8iMYyDOi+oYI4IU51MdA0UValw6go7oLnQXllnikMjFoWBfKbCMLy5BGeCMa6Z6w6PtnXNvZRXViGojeGOWnrHiAI9wo7FWG4HAIYZzrlfxq6ZqfAi7JebPUzUfSd3rI47pTxRl2pZVYMZ4yc4EiAh/mTke+gUz/AOtjzwfofpGcbLhIyAbDn9/3hZV08lO7SRxiWMjDwsMq47bT9DqsfFK3QdV9A3Sjs9RLXVm1litKQxl6d2YgM8oUPsO1wAWKnb27asJ+ooerunbpU9OTedPE5gjqPK3JvBRiQP8AGNre3BPvqu+iLnT2m4NB8VBVXp5FoK6OSAxNPLHF5rIxU843Ekg9yNLoGS27iaWUrlpfwnv+0AvEDwzo+gLBVXyw1N2orbUUyxS0VXDIpQEqGBZl9cW48HJwRg+xMN1Y9kn6diqaO7PXwI6x1dM86+euV9BGBjGduSPbIbkZPRPX1jpOo+nLbPHLWXWaKenaSirzJNTwRpKHkjRXJXLKCMcAjGeO1JfxA+Fli6UppbxZLU9BTSywuYJ1K+QrSDsCclG5GTyCMH2JcRkz7NzMfNhfp7ZOIt0bVydJ0SxRTSzUNUA8vwlTJTTUUpUKzxPGwzjAypBVtq5GrK686GfrHpGq646Rr5KatpFU/wDIRmOepZCu6J13FS5O1iR6Cf8AABzqn6PqnpuSD/5ZP8DVKjCop1BMSqCBlSe6tn8vcfUdp/obxZ/+HVYlXbK6N2mmCVNsYFoZ3BPfb2b5NwR9RorJp3WAV1bZuJI+F3WF1i64NnvdfB0heo6oR11LdRJ5E0v+cn/BnI9/qDjtdl1/hlvNdU7k63QQrkR+dbnaTaWZhudZQHxuwGwMgDjjQ51H0N0L/EzZGrbFUJaOqolVpWiQNJlfSVkVcA5IAWQft7ap9794m9GxwWit6Vv9wjpolWlkgutX6ICMojGnIRmHOTgH5jjShV8htSPcfpGlKY1pwSPUfWBZkwjJuNQxyVDKypn75HH10g1LPJJG5p4gO2dmxe33HOpGGjtqHMlY9VIp/wCmoP5s+2PYffSiNKTF8LTDaCQJGdFA+uOf3++vpp3nw0bcTUiO3hZHqSrpGQIz3UH2AOeP2Gm4q5HUiKIGAf8A1X2qDz7nH+ullpEeQtUV/wAROTnyqdtzf3GD9edSbQyMse4JTiLgGaUSOOc4PH/t/TUizKkIOd42p2nmkwTJMQCWEUbYGew9uPrr2WKdCCI4VXIG2BCxA+ZJOM9/3402kL4ZA0YTJAMcR5J5x75J1qIyka+XPHGMjiZQpJ+gIJ1O/eRqUbD9I9hkook8v4RmbGWVjnJ+XHA1slSsKuVENKG42S+oD6Bfr9NNGUQQu/nux7GQTeWv29QyfbkDSMYWqwFpfMJONyPuJ478nP8ATUaqldOrePKeB5pJJXnn2+4OVX9cH7akKejnm2iARRIACCZSS5+wB/vqJSnaBV3sznIADTBVH35GpSOv8yRISrSMcrukh8zbx7e5HfGpBEG4J2uP0t8VLs3yBp+yYUjn/wDLuf2048iYSSRx7BIv/UYpubI+rDA99N6cSlkRZDBt5KSxjGe5G3ONJm51AqGWSd2I9KwxLlWA+WcDGiCqih1XVx6KF8ZdnmcjuXPH2GNP47a6rG0rCnUctK7AHHyHPvqNatljj27/AC8nLIsxBHyAH+2t6epeokJaUyjB2hyNo+59zqdjBFiOTJSWWjpiDFU+Y/sFLkHjsP8AwafWy21dQhkKxmJ8srzyvx+mc/tnTCjVqR/MMsoB77YwACfbJ99PDdSW9UtRIFB5jkA5z8hwdRUGXrmOxTxKxIaMydjG0ZKjHy3c6kqe409II/Ogp5NuVWMKTk/LtxqFo/NuBUtPVYVsMGk27R25x76k1tEVA3nTP5gIyu9y5x8wB/rqh9ILUeRJemuElQ25ljpYxwIkhK5/XnTz4maRmLOzqPSq5bGO39B7aiKGneqOInenQHBkkIwP099F9qtkcCgvJJKW7Zbg6XZqjWJWePbRWwxxKqRssmcnGcD9NF1vuiYKSSl3HGDnjURaKET5IwFzj1DJI1PU1mRSnLKA4YsH+Xtn5HSORgZ6PpcTiqMn6Vh5SrFk5HG9tPaWieJ9y1BGDnOP9NJ0UKOu4ZbjIbGDqXpqVqnbEuVZu5I4Gsx2nsOnx3Um6Ktp6e2VlQschkgpJHSdASQ+09sc5zz21RPScTv1FB5jPJIoLnYR6WI5LfU510VKkXQnRtbcplMjiM7VUZZmPCj9zqk+jrRVmT41KYComYB5ZZSiohYbgE2+o43YJIwce2sXPuwE9Z0+yG5LVFBdP5vG8VRDT2yNFJiWnXMrFiG3Pu3ABdpACgZPJ9tDfU9vqqe7U1PZL+LVebnURRlTDveJcMS8QLKo3bNrn1E5HA41Yf8ALalgGAAIGMBO/wBx/tqB6wa6F0stvEtPX11NKY68AJHTsoXCq21iHPqx8skn2wPSSbjCuAKMLek5rjUdNUEl3p/hbi6eZU0rEN5TkkFQeeMduTx76iOoqO82/qK13O3SXSvomnSKqtdOYvh0jw2ZfVhsjjgE5+Wpbp+01tLaoBdap6qr8xpsySmRYi3G2PPYAdh9/np9c6Q1dFJSLWT0byqQs9NjzIz/AJhuBGfuMaPyN4uDR2jiFUfy5WQK+OGIwwBHPPtps0E9NVRmkljWmZnaeOUElie2wjGOe+c5zpt05a6mz0DQVt3qb1NuyairRFb2GAqjHtn7k/bUisaOS4IYk/4hyftqLuRxHAYEgE5xr0MpJHHfnnOP9tNijhd2CR8gNRstop4a6GuFXV0bRyNLKizfhT5UD8RSDkADjBGOfnqTOABmtFYZLf1xUX8Xa4PHLAlObY8g+FQDP4ir7Oc8nRvNHvQqoUKcYJ5yD3A+ugqi60sd6uIt9FcaeqqXjMqJDICHUAEkEd8ZGpujuM0kXkAhZYJFAM2dpQnJIxznGe/v9NDJB3EuAQaM0raqtN3208lOaaJELxeSxlBO7HrJ2AHA9ieD89A3X3hzT9W9NTWEsaalqQfNIkZnJySOSTn1NnB4IGMY41Y8sQZ2cFo1YABR+UAfLTCsplSJ28zy0Ay0hH6jS2THqEZx5ANpwP1n0refAmurehLi9TV9IX8hLXXROEamkaRSV3nhc+/yxxq1D0zStWivCzwTySfEssUq7S5XaxyB7gAH56t/xq8JYvFbw+qrKkipUORJBJJlQso7MTjPbPb6aobwtv8AV9Q9MPSXKIxXqzzNbq0Z/NJHxux7ZGD++oylnTURRHPtHr9DDdLSZdF2rcewjkfX4wirJq2CcGYpWQSAebDkASqO4OBww/8AODqvOtPDemo+mbVD03TrUie5w19ZR1NUqxpHFLuKgTSYZiMcDAPv89Wh5JBbOA3+buMaZUxWpllMTRI6napKbk49jnsP3H10grspsTWbCjLpqc7eKXR/RcvU2zp63VVPWO+5qCn/ABPLLHcXjbcdwHPpJyvbJGDoP6wstAlypMT1VOa2nkEVUab1yylcJ5gbIODnJX2Ixq9+vuo6PoSjut2uEW6pmmjlPw0Y8yVSfLRI5CCIgqh8kd8ge51z54v9V2zqR7RQ2C111opqCNfhqapfMqsxJdhwCQxK/PG3AOABp3E+XI432mJ1GPDhsbX6Rz4ddUSdB1VIaO+m2itIjnleNkkpXxlWyvLIwG0jjv2HfXW/R/8AF1Z16fpBdrbWpXBQsjW6mWWF8ADcCzAjOOxzj565n6foW8QqO3/z+37rvb5UhmqqmpCrsONkZ5yASMAdgX4I0T0/RMtsM1MaKkmWOVghkZHdVzwrMMZYdj3PHOuYqDqY7wKFlFLxA0SXKsj3ealIc7juiXge3t20rBTyKyy1MslfIeFG7CZ9s5/fjTlaKoWItXVCJgZVDgtjtwqj98/103e5I2IVLsACS7MBxnPyz/T6a+obDefDAWOw+X7x5HUyUKhQ8KYAyDgk8fIcn79vnptHDTGKOqq3kllJO1GYjJ9+MYA/bSEshgV5SVPA/EcgH6cd9IKv8xKOJcDHCuPT+7f+2qlhJCk99o6kkhjmQQPC8p42h8t+pOCfsNKI7AZlp0gPJMmze3Pc4Lca1DtExUTxhSuFSP1gfXAH+o15NB5Y8uN8l/W4Y7No+fBwPtqCTOAAmvm03nh1pVyQMS1LsDj2IABA/pp1BA1Qu1JsAjvTjDf/AOgPrraz+ZVRVKJUFVjQEK4bL5PZTjHHc7iBryplE2IFLygNlcSBgM9+wI51E5iBNi0NNIC8k8jY5RWD4P1b/bW63kk+RQ0rQ84ErOA+P3415FavNIQCPcecMNqgDvlh3PfUh8MscbIZadYQBlIgT/Xn99WAMAzqB6xGmtjyL5k9SjSHB3KzFsfLtxp7SzPSJIKanhZByWZSST8+e+sFzprfxgO6D1o8g3H/AG+2kKq61NxAYCQoAdqhT6R9h30SwOImSx7T161qgv5zl2PBjwFwPkM/30rSXCHd5cUDZfjcW7fvj/XUb/LvPBkaRg7NhiRwfmMe+nENbFRxgPGDjsV4Jz7Z+eq6jIYKeDCBrMtQwLtTRQ4GELkEn6k/PTqksdLCC5dHc+6SYP2+X9dCsdbPXVOZB5SIdu05/wB851MLVykqmWdfZSclv/8Akdh/XU6gRE3tTCeK4JRlI6RvX2ZdocY//I6laV5JkX4mqCtkkJGdw/Yf66E6TcUDqfMb2jAbDfL31MUlxmjGyaeNS3JiQbgB/YaEzCVQEmzDG3VkAVVSd2Pfywqqc/PGiK2VDXCaKKEPUVD8KixksT3wB9tAUNaaqMlayNwpwY44zkfqRqUoJ6u37JUqZqPy87WBLMDjv8tKPvxNrp2oi+JallhmfYXSSPzAWj81CpcZIzzzjIOiqKGNFXhX+fGqgsfUswkVmnlnIXAMrEsAPvo2tV7qKxowASjchzke+ksitW89N0ubHdKDDmOpAYYGSPpp9abi71x2ocFTxn31EUcVQUO5ht2/mJ769vFzbo3p2S6FS9dOfKo0dCysx7uR7hRzj31lZWVFJM9l0qMxFRHxh8RYrrR09lpJRIkH4lU8ByAwB9PyOACT/wBtB/RHV9ZeLrQ2i2WuUwRwxT1VU0TCEpIWA8uQkAkYUkDOc/TQ5a7EeqK1oqtZZaKbK1IbhZQe4JHz/sfpq3ekLdbegumo1/8A4+ip0Ijp/PZo4woJCxqTgcLwB9dYyk5G1Gelpca6QLjrqapjqXjsUctwF0q6eSWBqGRonAQjP42CqHnjdnPONM7Jbr7aSlPbqaSagaseSplvtbvqNrEElPLyCB6sBj3PPA5juivGuDrS60sVNPQJa7gjGhJqDHPMQSQ4ibkqy4IPHBzzqxaieOkppJZnWKJF3M7HAVQOSf76PvyYtqHAEHr/ANTU9luVtiqquKmimkZZTO+0KpU7SOO5K4/fU6EEyq27crdmU5yD9floF62t79ZXOSwUvU9BE8tIWmt3wgepMORuMc28FASQCQvGdH1GHMKmWFYnxnykbcFHsAcf6ahbN3LMKqJPGYogqqcHsTyP6a8VHL5clRjjAxp1KxYf5cfTvrQIigkk7u4Pz1apS5qSkCqoBAx7nvpAhdxIUDPfHPA1tPFhgdvB+ZyTrGPIBPGCNWkSJTpqzwXGkrY7ZSQ1VIjLTzRRBWjVgQVGPYgnjTTqm+1loWVaeONg0bMJHfae3DAY+ePcan3kU5I98cgZxqlOsOu+tOi+taMV/RfU9ba6ypSOmlt9xSpg8r/GxhWMFfzcbgAcfmyDqhS1IBqXD0bYXLU6rtddT3q2Xal6mrqZKho0SyIsfkVLhSfL3lSV3EHnsMHSvS3UNff7UlVUWg2qd5HSSKrcM3pGAU2E5UtnB44GffUnZbkbtSTRSmSnqKeVC8TssjIrL+U7e3KnjJP76lBRxRblWMjHu3f76DoprBhQ21SMeofyYxM9OsjDaxBIRpCOwJ57g8d8a5I65lPQHjU9wqalZKHqal8iaahpmSM3GI7BhDnvkA59uTrp7rTpusuFFMi0tPdgMSQw1CEoswyUkJUg4U4/KCcH96V/iet9bb/B+3Xapo4f5ta6iOtE1G0nlwSkEMYz3IZsct30JSWzBSNuPjCvS4iyncb/AA3/AIgdT9XzSdd3Oy1USpErhKIxK3qKRLJMXP03qBjRPSVNPVSFVkXdG2wq2Rgn/TQibXDDZrL1LJSGO7yUsPnV8khbyfMCNIZHJyQxXbk57gcdwx6OtdwpL3XV1VM9fJWUlKJKmGRXhLRIQx75BOe+O3fSjoNOoGbOPIQ2gi/2kd/Ex02lZ4fvvrI9tumFZNQiULNKrDaCn1DEE+2M++uaOlJK7yY1qd9xhRh5dFVU5qUJwffcCnfuD7dsa6v8T/C6PxXksU63emskqo9JV1dc4WGONfxNxPcNgMAfmRrkLrClh6dlKUrVNXRyzuaConwkcsSNt8zaDxuwPT7DuTo/S2+MpfeY32gNOfURX1j++XuW1w0BL1FPdlp1idRRiJWiH5GY59bBvTuAAIUdzrax9T2+2W9IV6agvPJJqaiaSNs/LAcdv9TqKq+qLvVU1qq6u4Q1NQkpaIxMhKrnlGX2Gc8Ea6h6L8FOk+qelbZcWv8Ad7JVSwj4mltVHBWwCb/GQ3Gw57pyAQSCQRpkroABEQXGchJSUx8As26R1ZFZuWWVYt37nJ/76cwbKdCxjiGDkMGy2D9Rx/vpqaCmdhNLUMyZ/wAePV9lzz/5xrcw04ORErIMH8TGSPogP9+NfRRtPjRs94qtSPO/5SENIAQGnkDEZPtkDT+nhlWKWQzEPEuXKsCwBOMDPvk+2mZleZfKp422Yy4OAx+hYA6bSI8MYWVVp4AxyOzP/b99ddQfOx/mOYqxItrRgxqWxvlO45+me3cc8Y0tFWPWOypHEzZwWLb+3vnsP00wp3jfJdWSIEAGQ+n9jpZrrUS/gwSPL25hQKo/pz99cD7ZRks7CPAyxowknL7sqU7gD3wMc57a1ikCZWGkeOZgVLs204+QHb/30pbYAUeOaSNAWDEOA2COxzj/AF1J1d2pbYPIVEmlA5lDekHA4H/tq4HrAM5XZRcbxUc6rJIuIgmAJJCM4P3wOPrnSFXIYsGonEjY/PDyfvnjTKqnjqKjLxsZewG7Df11tHSoXZlhkC9iwYkH58d9VvsJ1Ei22i3nrEWWEoJXGSrAEn9QPfTq21TJUxwVE0dKHO3cCVUZx6jj2HzwffjTJG2IdojihHeVlyx0vBAtUSsGag/mZ5WUYx77Rg/rqNztKs6LuY+IFYD5B28EbmdvWQe4ye36abyUCLMiVk7iYjdtAIOfYZAPH3xpV7fI0e6OUM3HCvhR92x/r+utIJ6iE/8AMVUmCcCKIZJ+xI1JFcxLxAbCmTFLTLGu5KABR6QwbYScds85/udSNEla8JKxKFIzsCFWP6++o2httXnfATBleBMwDsO4GD/7amoYoRlqmYeeeSzZcg/fPf8ATUFgBFaZjuY8htdTOSzRsTjc3mnag+zDk6kqWgahBLxwqGG1UReR/wCfXTShWPJcSSVMh4LAbdv3x/bUxHU4QAqKZRwCU5/3Ol2Nx7Eo7xeHzcgySJFwAFABA+57e3bUvQzS0/nZ8lo4k3tLJ+VR88f7DUTT01OMSIGmH/3JCc5+QX/vqepYJ5Igqw4Qry7L3+/t+mhG5p4hRFySs1f8dTQVCxu4fDKNmD+vyOrEsMEtRFl4kU+4U5OgW32+oooPOGIYVI4B5PIHbv76MrXb6pdrM8hX3OeMfppHM+1XPUdBiJbVW0NLZa56mtSASPIG42Jyc6BfE7qqfqC4RWWGJWNuRoFEanbPMPzEZ52g5H2++iO3+JVD0LcK+GthaSrNGstN32PlyuCcYB4z88arajuFzrOtqL+XRUQapWoaOS4tIYZJg8R2MEOdxVpCO/Y8cY153qG1toBn0HpU8JdREmLhTTdD2SC6NuBWMRC3RQGbzZWJ2ttzv/N3x2Bzg41Y1Z0lS9edA22luDSRpOkFSx8oI+7ALAqcgcFge+M6nOmqatt9qge4mJ6xVImalDJGefYMc4xjvqRatQght5HPP/fQkxgG44+W10V3g1b7FS9EdNW+32+qhobbSIlJA00QJRC2EXOOwyByO2eRptW9Y1Fn6VtdW0Nb1BVTOYJarp63NUL5ikhn2bgVUkYzzqA8TfDGq8QZGx1VcLdQ+ZG6USw+bArpIr7irOAScY+WD2zzqY6OsFs8NOntgnZYKeFg8w/DgCB2fIjDFEOXO4rjPvq+kkm+JQlQoo7+6JdEWW9VfUFTfrxRi21EkfkiArGzzKUjO5ipPlkMrDYpwc5OSdH3ESEAZxzzxoFv/ie1o6ee6UFnqLlNHXLST0MZAmUbiHdB2cqATjIz89J9KeJP8/usluqaSX1M7U1UsbLFNGCSu4HlH28lT9tTsu0ii/mEOJJvUFAwTn1fP7aS81V4JIzxzyNR12lrozEaCnjnzkOJJAu0Y4IJ789/pqJtd4vMdM5vttihq5J5Fght0wm3RhSwJJx6uDxx7am6lALhUZN4A4wfYnkaTAPYHJJ7sOw0jTfFXCjiqEpZ40kJRRIFDbhkkYDHnGlKiiraYkSwyxcdnjI10iojWBVppDJMYE2lmkVgpQAEk5+mhPpG008t7uV8ourbxfkq3aOWnqq5JqSOQHICKqDaVBAwD2PvqT6wtMvUnSl4tIqDSyV9HLSrKr7ShZSMg+3fQD4XUyeE1moOmZbatN8VWO8L/wAwSdnZjkscAH0hR7dhqrOFFmEVC3EsPw1tFwskN4juFJa6M1dS1Wf5YrL50hJ3yvu7sw2fbbosnuUiwSPBAKudMARpMq5OexP+Hjntqu+nq6u6pm6jqqKoiEFdQmO3zxysmFK7MtkenDliDj3+2ud+mfBfxE6P6dr6a3X2spL7e6N6iSkiqcpuhk27GZgHG5DkEcEnn06UOa913hjjZTREtXxQ8denrjZJ7bZuo6eK6wVagrFJLCskQkKMVOMSdvbI9+3Oq2uS3bq/oiWjq7g90r6ipIijglJWVkUPyr+lVZ4wzL3AHfnGjnwZ8OrTebVbai5Q22K+RQoauS3VJlnkCuylS24hEcbQyr8iAdRHiTLReIkdr6f6RQ2yKCY1fwpC0RklZ9rKspPc4diO7d8nB1bFrFMwkEa7Uem/u/plSrbOqYfC23pUrJWX2jnlkeQSPL5m5G2ebGEJIGQNpGOAdHHUwas6IAswc+Z5SVAt6qJZYcr5qKOBuKgj2PfGND/T9/qvDCgNF1JSVtVdbnfWpVdMSJtZgkf4gJBKquMd+DqyrsjICadA7AcJM20cHHcD/TS+Zm1WfW5rYMaaNK+gEhOqLdF1B4Z9RUtJBUMzU5qFimi2SAocgY5747Z1yNf7RH8V07VxUsz00tS4kljUqrDjei5AO9QQSFB/MDrr25dYRdIWme71oqI6WBA05gTeVXsTgckDPf5c6548V+p7V1XVX+Grq6t44fKqaRIahN1YQrAlW2tsUZTag5y755wAPpFIcnev6It9pqraXJ3AqvrKVvlDTXG60kdokSoFbOIUBBUbs4BJPzz30Uz9AXDphIKSs6ittnqXj816OomKOmSRztBDdu4+3tqAvtL8TX2WhqZHV/O8uVV7RD0+lR7kA8n3xq4rT4E2jrG00VzhnusgkiCMpnEpRlJDDLDPcEgewI1ptnXEqhm2mN0+LxSVAs++oOUVmq66WVzOmyEDeCP7cf3OkhtpZtuS0xBOdvpA/fOefoNZrNe/AAE+OsxJqbRTfF10UEa7M8AglRx88f6Y0tdLaKACR3BkYkAqCcD58nvj76zWa7kQZJB2jaBYfNUJvklcE75sHaP9dLtOaNgzEckBY0Ubcn59v3xrNZqeOINiW2MVqpZFkIdUzkKwBJHt2H+2NJHMSNMzs+0n0H8oHvjWazUGD4H5yXr7WbXujqGRQTnbCpYYx9SMaZ1xFHIkSopyN2STn9++s1mpOy3Bc5Svbee0VD/MZTJvePZyMPkn78a3+Liid9m92jIVywAz9u+s1muGwBgMnmJBhBR+ZUwoHWNSADvUeofUfU9uflqZtYp4ZlhRJJGXG6SR/c/IazWaLysxfxycBp6mNFIkM5Knc2CAueT8ycdgdLWqmFzmmXJeGKNpNsvuACSMD7HjWazSTE203lxqVxbcnf5R6KGSniM0WyIEblEZIHb5Y4/TWUygCIiNcncCzEtyB3we+s1mqmVx7mO6SIGZWLkhRuAUbB9jjvontnmXeJT5nllR8uP01ms1VjtH8It6lhdO7UdIZPUD8uM6MaiRI12RpsLOEB+WeO3y1ms1iZjvPo3QKAgqVf4m173LqRrXCfKFLshQvkgscFm4PGcjt8hq3uien6axWyGnp8+Wv5mYep292PzJOs1msFN3JM9a2yKBCar2vHtcZVuMYzxnTYUkEYZhGCwO7kcZ1ms01ACbS11ro6CWWrWqEi84gRCo4PzP01XF26v6d64uVt6dssdZS1tyYQOblRRS0xjYFnDKsgJyFOMEc4znWazUXTS9bXDC9mfoHp1ErVtt0pZpnSWRbd5chBywG0yEEDkd/lqG6C8LqK7W4dSWvyqWCu3SQ+bEoliDHLINowq5HAy3c+2NZrNXABW5x2AqTVvt8lExid95lkEaEsSR9ST3ORnt76a+HfUlt67pau5wUsweiuFRQqanAIZPSxGCeCCfrrNZoRJ1AQbbLcJq6hNQIo4qqeiCS+d/ypChjyMMMYYZOefcA6XkuFygO2G4MucqTLGHyOfkV+us1mrwIms1+uQBkkhoq4ReljMm3gc8DDc/roN6q8OoOs7pZLxK8dAbbR1NOI6ZTuZ5WXbLv9mVQRjGCWOs1mhkBgQ0urMpFGUbJ4i3Dwx6wrekqR5LpPFQJTwNVvtjlYlnLSPhnAGFwq/XPtiH628Qb1X1tzirbnUR1NroahjBbP8AlYh+E3eXLSyZA5wY9ZrNAPk0hfUTRT/ZqLb7GFX8EM0lw8L6utqYKOMtW/D76WnWN5AkYIMh/wAbEuSST7nQL/Ez1p0/4W9d2q1VFruVVT3VkuNQ0Ff6RtlONsbLgMNgYc4Occd9ZrNbGVFXMwA4mKrk41vvU16K8QOm/Em7fymktNTaLslS90Sq2xyo8i5y7Z/xEHB4P399WFXWxpKBo6gpIAnlStHlC27IJHJxx9dZrNeb6jYmp6/pjayhbHd6iy+ItV0ZE80lhgpnp5KGeoMsQmlVmym4FthWMjDMcE8cca526iucVA9HakjPmWSqqqVpVCqJU35Q4HO4YIJJPZe2NZrNN4PvfkPrMHrD5a9CfpHl/v8APA1rjqB8RMrGd3zhpJJArtlwMgY2Dj69tS9J40dV2RZIrNcJbZRSyGYU6urhSe/JT6azWaKMSMBYigdlIKmp/9k=">
                        <div class="carousel-caption">
                            <h3 class="text-dark">France</h3>
                        </div>
                        <div class="card-body">
                            <p class="card-text">Bonjour ! Explore France, buy baguettes and climb the Eiffel Tower !</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    <a disabled type="button" href="https://www.google.fr/maps/@45.5413916,3.2551393,3a,75y,324.55h,85.24t/data=!3m6!1e1!3m4!1sAs-Nw2I5l8aHYqLrEslxkw!2e0!7i16384!8i8192?ingame&time=30" class="btn btn-sm btn-outline-success">Play</a>
                                    <a disabled type="button" href="" class="btn btn-sm btn-outline-secondary">Custom</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
<footer class="text-muted border-top pb-3">
    <div class="container">
        <br><p>Made with ❤ by Martii</p>
    </div>
</footer>
<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
<script src="/docs/4.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>

</body>
        `;

    } else if (localStorage.placeguessr && localStorage.placeguessr == true) { // Create the game
        //// Title / URL settings
        tabIdentity();
        gameUI();

        //// Important variables
        var url = window.location.href;
        var mode = getUrlParam("mode", url);
        var timer = getUrlParam("time", url);

        //// Start new game if none are running
        if (!sessionStorage.spawnCoords) {
            // créér nouvelle partie (coordonnées aléatoires, init timer, score 0...)
            if (timer) {
                sessionStorage.timer = timer;
            }
            var randomCoords, lat, lng;
            $.ajax({
                dataType: "json",
                url: "https://raw.githubusercontent.com/MartiiDev/PlaceGuessr/main/datasets/world.json",
                async: false,
                success: function(data) {
                    randomCoords = data.world[Math.random() * data.world.length | 0];
                    lat = randomCoords.lat;
                    lng = randomCoords.lng;
                    sessionStorage.spawnX = lat;
                    sessionStorage.spawnY = lng;
                    sessionStorage.spawnCoords = lat + "," + lng;
                }
            });
            window.location.href = "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint="+lat+","+lng;
        }

        //// Storing variables
        if (!sessionStorage.timer) {
            // alert(1);
            document.getElementById("timerdiv").style.display = "none";
        } else {
            // alert(2);
            startTimer(sessionStorage.timer);
        }

        //// Displaying minimap
        var map = L.map('miniMap').setView([0, 0], 1);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            minZoom: 1,
            maxZoom: 20,
            tileSize: 256
        }).addTo(map);
        $('.leaflet-control-attribution').hide();

        var marker = {};
        map.on('click',function(e){
            var lat = e.latlng.lat;
            var lon = e.latlng.lng;
            if (marker != undefined) {
                  map.removeLayer(marker);
            };
            marker = L.marker([lat,lon]).addTo(map);
            document.getElementById("guessButton").disabled = false;
            sessionStorage.guessX = lat;
            sessionStorage.guessY = lon;
        });

        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        resizeObserver.observe(document.getElementById("miniMap"));
    }
})();
