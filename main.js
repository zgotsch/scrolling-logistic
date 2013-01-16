$(function() {
    var canvas = document.getElementById('paper').getContext('2d');

    var scroll_force_scale = 1;
    var gravity_force_scale = 1;
    var time_step_scale = 1;
    var mass = 1;
    var position = {x: 0, y: 0};
    var velocity = {x: 0, y: 0};

    var down = {x: 0, y: -1};

    function drawMarker(x, y) {
        //x, y are graph coordinates
        canvas_x = 5 + x * 40;
        canvas_y = 208 * (1 - y);

        //clear the canvas
        canvas.clearRect(0, 0, 810, 210);
        canvas.beginPath();
        canvas.arc(canvas_x, canvas_y, 5, 0, Math.PI * 2);
        canvas.stroke();
    }

    var logistic = function(x) {
        return 1 / (1 + Math.exp(-x));
    };
    var my_sigmoid = function(x) {
        return logistic(x - 4);
    };
    position.y = my_sigmoid(position.x);
    var my_sigmoid_prime = function(x) {
        var my_e_value = Math.exp(-(x - 4));
        return my_e_value / square(my_e_value + 1);
    };

    var square = function(x) {
        return Math.pow(x, 2);
    };

    function normalize(vector) {
        magnitude = Math.sqrt(square(vector.x) + square(vector.y));
        return {x: vector.x / magnitude, y: vector.y / magnitude};
    }
    function sum_vectors(v1, v2) {
        return {x: v1.x + v2.x, y: v1.y + v2.y};
    }
    function dot_product(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    function direction_vector_from_angle(theta) {
        return {x: Math.cos(theta), y: Math.sin(theta)};
    }

    function scale(vector, scalar) {
        return {x: vector.x * scalar, y: vector.y * scalar};
    }

    function simulate(f_vector) {
        //updates position and velocity
        gravity_vector = scale(down, gravity_force_scale);
        var fn_slope = my_sigmoid_prime(position.x);
        var theta = Math.atan(fn_slope);
        var direction_vector = direction_vector_from_angle(theta);
        gravity_vector_wrt_function = dot_product(gravity_vector, direction_vector);
        gravity_vector_wrt_function = scale(direction_vector, gravity_vector_wrt_function);
        total_force = sum_vectors(f_vector, gravity_vector_wrt_function);
        total_acceleration = scale(total_force, 1 / mass);

        position.x += velocity.x * time_step_scale +
                      total_acceleration.x * square(time_step_scale);
        position.y += velocity.y * time_step_scale +
                      total_acceleration.y * square(time_step_scale);

        velocity.x += total_acceleration.x * time_step_scale;
        velocity.y += total_acceleration.y * time_step_scale;
    }

    var wheelDistance = function(evt){
        if (!evt) evt = event;
        var w=evt.wheelDelta, d=evt.detail;
        if (d){
            if (w) return w/d/40*d>0?1:-1; // Opera
                else return -d/3;              // Firefox;         TODO: do not /3 for OS X
            } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
    };

    wheelValue = 0;
    wheelTimeout = null;

    samples = [];
    samples_length = 4;
    function get_sample() {
        var x = 0;
        if(samples.length > 0)
            x = samples.pop();
        //console.log(x);
        return x;
    }
    function push_sample(x) {
        samples.push(x);
    }

    function wheel(e) {
        if(wheelTimeout) {
            clearTimeout(wheelTimeout);
        }
        var distance = -wheelDistance(e);
        //push_sample(distance);
        wheelValue = distance;
        wheelTimeout = setTimeout('wheelValue = 0;', 100);
    }

    function tick() {
        //console.log(wheelValue);
        var force_magnitude = wheelValue * scroll_force_scale;
        //console.log(sample_average());
        //debugger
        var fn_slope = my_sigmoid_prime(position.x);
        var theta = Math.atan(fn_slope);
        var scroll_force_vector = scale(direction_vector_from_angle(theta),
                                        force_magnitude);

        //console.log(position);
        simulate(scroll_force_vector);
        //console.log(position);
        if(position.x < 0) {
            position.x = 0;
            velocity = {x: 0, y: 0};
        }
        position.y = my_sigmoid(position.x);
        drawMarker(position.x, position.y);
    }

    var test = $('body')[0];
    if (test.addEventListener){
        test.addEventListener( 'mousewheel', wheel, false );     // Chrome/Safari/Opera
        test.addEventListener( 'DOMMouseScroll', wheel, false ); // Firefox
    } else if (test.attachEvent){
        test.attachEvent('onmousewheel',wheel);                  // IE
    }

    setInterval(tick, 100);
});
