(function (global) {

    var Speedometer = function (canvas, speedo_width) {
        if (!this instanceof Speedometer) {
            return new Speedometer(arguments);
        }
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // the center of the speedo is at bottom center
        this.center = [canvas.width / 2, canvas.height + 1];

        this.width = speedo_width;

        this.max_speed = 50;
        this.speed = 0;
        this.current_pos = this.getAngle(this.speed);
        this.pos_update_q = [];
        this.moveNeedle(this.current_pos);

    };

    Speedometer.fn = Speedometer.prototype;

    Speedometer.fn.drawBackground = function () {
        // draw half circle
        // TODO only draw half not a whole circle
        var ctx = this.context;
        ctx.beginPath();
        ctx.arc(this.center[0], this.center[1], this.width/2, 0, 2 * Math.PI, false);
        ctx.strokeStyle = "#c2c2c3";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    };

    Speedometer.fn.drawNeedle = function (angle) {
        var ctx = this.context;
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.center[0], this.center[1]);
        ctx.rotate(-180 * Math.PI/180); // Correct for top left origin  ????
        ctx.rotate(angle * Math.PI/180);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.width/2 - 20);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };

    Speedometer.fn.moveNeedle = function (angle) {
        this.current_pos = angle;
        // reset the canvas
        this.canvas.width = this.canvas.width;
        // redraw the dial
        this.drawBackground();
        // build and draw the needle in a new position
        this.drawNeedle(this.current_pos - 90);
    };

    Speedometer.fn.getAngle = function (speed) {
        // start angle at left of circle
        return speed * (180 / this.max_speed);
    };

    // each time this is called it resets the queue of needle placements to render with the goal of getting to the angle provided
    Speedometer.fn.updateSpeed = function (speed) {
        var curr_angle = this.current_pos;
        var goal_angle = this.getAngle(speed);
        var total_change = Math.abs(curr_angle - goal_angle);
        // fastest the needle can move is 180 degrees per second since our range is half circle
        // create a queue containing enough elements to move from old angle to new angle in increments of 180/s
        if (this.pos_update_q.length) {
            console.log('not empty ', this.pos_update_q, ' ... curr_angle: ', curr_angle, ' goal_angle: ', goal_angle);
        }
        this.pos_update_q = [goal_angle];

        while (Math.abs(curr_angle - goal_angle) > 0) {
            var delta = Math.abs(curr_angle - goal_angle);
            this.building_q = true;
            // slow down as it gets closer
            var step = this.getStep(total_change, delta);
            if (step < 0.2) {
                step = 0.2;
            }
            if (curr_angle < goal_angle) {
                goal_angle = goal_angle - step;
                // check if we went too far
                if (curr_angle > goal_angle) {
                    goal_angle = curr_angle;
                }
            }
            else if (curr_angle > goal_angle) {
                goal_angle = goal_angle + step;
                // check if we went too far
                if (curr_angle < goal_angle) {
                    goal_angle = curr_angle;
                }
            }
            this.pos_update_q.push(goal_angle);
        }
        this.building_q = false;
        this.animateSpeedometer();
    };
    Speedometer.fn.animateSpeedometer = function () {
        var q = this.pos_update_q;
        var that = this;
        (function animloop(timestamp){
            if (q.length && !that.building_q) {
                requestAnimFrame(animloop);
                that.moveNeedle(q.pop());
            }
        })(0);
    };
    Speedometer.fn.getStep = function (total_movement, delta) {
        var step = 1;
        var movement_remaining = Math.abs(total_movement - delta);
        // accelerating needle when starting movement so angles should get closer together as end of q is reached
        // delta is close to total change
        // 50 apart and delta is 50 move .25
        // 50 apart and delta is 49.75 move .5
        // 50 apart and delta is 49.25 move 1
        if (movement_remaining === 0) {
            step = 0;
        }
        else if (movement_remaining / total_movement > .95) {
            step = 0.5;
        }
        else {
            // decelerating needle when near goal angle so angles should start closer together at beginning of q
            // delta is close to 0
            if (delta < 5) {
                step = delta / 8;
            }
        }
        return step;
    };

    var WorkoutRunner = function (metric, callback, interval) {
        // calls callback every interval amount of time passing data about the workout at that moment

        // tell me how long it should take or use a speed like 'fast', 'slow', etc
    };

    // now when we say 'go' the runner will begin running and munching up the array of speed values calling moveNeedle for each one

    // but we only want to call moveNeedle in a requestAnimationFrame callback

    /*
    with each frame we use the timer to calculate if we've reached a new speed value
     */

    // shim layer with setTimeout fallback
    global.requestAnimFrame = (function(){
        return  global.requestAnimationFrame ||
            global.webkitRequestAnimationFrame ||
            global.mozRequestAnimationFrame ||
            function( callback ){
                global.setTimeout(callback, 1000 / 60);
            };
    })();

//    var test_speeds = [
//        [1, 10],
//        [2, 10],
//        [3, 12],
//        [4, 15],
//        [5, 20],
//        [10, 15],
//        [11, ]
//    ];

    var test_speeds = _.map(_.range(50), function (time) {
        return [
            time,
            Math.random() * 45
        ];
    });

    var init = function (speed_array) {
        var speedo = global.speedo = new Speedometer(document.getElementById('speedometer'), 400);
        var iter = 0;
        (function animloop(timestamp){
            if (iter < speed_array.length) {
                // skip ahead to the most relevant timestamp

                //requestAnimFrame(animloop);
                if (timestamp / 200 > speed_array[iter][0]) {
                    speedo.updateSpeed(speed_array[iter][1]);
                    iter++;
                }
                requestAnimFrame(animloop);
            }
        })(0);
    };

    init(test_speeds);

    global.init = init;
    global.test_speeds = test_speeds;

})(window);