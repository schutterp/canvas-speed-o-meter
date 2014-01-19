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

    Speedometer.fn.updateSpeed = function (speed) {
        var curr_angle = this.current_pos;
        var goal_angle = this.getAngle(speed);
        var diff = Math.abs(curr_angle - goal_angle);

        var getDelta = function (positive_inc, diff) {
            var result = 0;
            if (!diff) {
                return result;
            }
            else if (diff < 1) {
                result = 0.25;
            }
            else if (diff < 3) {
                result = 0.5;
            }
            else if (diff < 5) {
                result = 1;
            }
            else {
                result = 2;
            }
            if (!positive_inc) {
                result = -1 * result;
            }
            return result
        };

        var delta = getDelta(curr_angle < goal_angle, diff);
        this.moveNeedle(curr_angle + delta);
    };

    global.Speedometer = Speedometer;

})(window);