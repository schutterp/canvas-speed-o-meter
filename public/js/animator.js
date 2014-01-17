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

    // callback will be called during playback with the 'current' values for each of the timeserieses in the order provided
    // second thru n args should be timeseries. Each ts should follow this format: [[seconds, value], ... ]
    global.Animator.prototype.run = function (callback) {
        // accept one or more timeseries streams
        var streams = Array.prototype.slice.call(arguments, 1);
        // create a shallow copy of each of the timeseries streams
        streams = _.map(streams, function (ts) {
            return ts.slice(0);
        });

        // given a delta in milliseconds (1000ths) return seconds into the timeseries
        var getProgress = _.bind(function (milliseconds_since_start) {
            // running at 10X speed, 10 seconds per every second or 1/100s per 1/1000s real-time
            return milliseconds_since_start / this.seconds_per_second;
        }, this);

        var start = null;
        var progress = 0;

        // init current results
        var curr_results = [];
        _.each(streams, function (ts) {
            // keeps the value at zero until progress is within a second of the first data point
            curr_results.push([ts[0][0] - 1, 0]);
        });

        var animLoop = function (timestamp) {
            // timestamp is thousandths of a second
            if (start === null) {
                start = timestamp;
            }
            progress = getProgress(timestamp - start);

            _.each(curr_results, function (curr, idx, results) {
                var t = curr[0];
                if (progress > t) {
                    // progress is now greater than t so pop off t until it is gt progress
                    while (
                        streams[idx].length &&
                        progress > t
                    ) {
                        results[idx] = streams[idx].shift();
                        t = results[idx][0];
                    }
                }
            });

            // call callback with some data ...
            callback.apply(this, _.map(curr_results, function (curr) { return curr[1]; }));

            if (_.any(streams, function (ts) { return ts.length; })) {
                requestAnimFrame(animLoop);
            }
        };
        requestAnimFrame(animLoop);
    };

})(window, _);