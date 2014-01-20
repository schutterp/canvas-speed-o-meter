(function (global, speed_data, pos_data) {
    var mapper;
    // init the map
    google.maps.event.addDomListener(window, 'load', function () {
        mapper = global.initMap();

        // init the speedometer
        var speedo = global.speedo = new global.Speedometer(document.getElementById('speedometer'), 400);

        global.speed_data = speed_data;

        // init the animator
        var playback_speed = 'normal';
        global.animator = new global.Animator(playback_speed);
        global.animator.run(function (speed, pos) {
            speedo.updateSpeed(speed);
            if (pos) {
                mapper.updatePosition(pos.lat, pos.lng);
            }
        }, speed_data, pos_data);

    });



    global.seeResults = function (results) {
        console.log(results);
    };

})(window, window.speed_ts, pos_ts);