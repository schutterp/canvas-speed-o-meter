(function (global, _) {

    // shim layer with setTimeout fallback
    global.requestAnimFrame = (function(){
        return  global.requestAnimationFrame ||
            global.webkitRequestAnimationFrame ||
            global.mozRequestAnimationFrame ||
            function( callback ){
                global.setTimeout(callback, 1000 / 60);
            };
    })();

    // Runs through an array of tuples at playback_speed speed, calling a callback with the value
    //  at the 'current' time during playback

    // use playback_speed to set the speed of playback in seconds per second
    global.Animator = function (playback_speed) {
        this.seconds_per_second = playback_speed || 10;
    };

    // timeseries is [[seconds, value], ... ]
    // callback will be called with the 'current' value during playback
    global.Animator.prototype.run = function (timeseries, callback) {
        timeseries = timeseries ? timeseries.slice(0) : [];
        var start = null;
        // keeps the value at zero until progress is within a second of the first data point
        var curr = [timeseries[0][0] - 1, 0]; // TODO careful ... should ensure each item is array of ln 2
        var progress = 0;

        // given a delta in milliseconds (1000ths) return seconds into the timeseries
        var getProgress = _.bind(function (milliseconds_since_start) {
            // running at 10X speed, 10 seconds per every second or 1/100s per 1/1000s real-time
            return milliseconds_since_start / this.seconds_per_second;
        }, this);

        var animLoop = function (timestamp) {
            // timestamp is thousandths of a second
            if (start === null) {
                start = timestamp;
            }
            progress = getProgress(timestamp - start);

            if (progress > curr[0]) {
                // progress is now greater than t so pop off t until it is gt progress
                while (
                    timeseries.length &&
                    progress > curr[0]
                ) {
                    curr = timeseries.shift();
                }
            }

            // call callback with some data ...
            callback(curr[1]);

            if (timeseries.length) {
                requestAnimFrame(animLoop);
            }
        };
        requestAnimFrame(animLoop);
    };

})(window, _);