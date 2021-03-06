//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////                                                                      //
////  PhysicsSimulationLab  //////////   v0.0                                                               //
//////////////////////////////////////                                                                      //
//////////////////////////////////////  Copyright 2017-2018,                                                //
//////////////////////////////////////  Last vist: 10, 05, 2017  by Raymond Wang                            //
//////////////////////////////////////                                                                      //
/////////////////////////////////////////////////////////////////////////////////////////////////WANG  XU///-->\



function threeStart() {
    addScript();
    initThree();
    initCamera();
    initLight();
    initObject();
    render();
    animate();
}

//define physics var
var step = 0;
var dt = 0.001;
var skip = 100;
var skip_data = 5;
var g = 9.8;

var plot2D_position;
var plot2D_velocity;
var plot2D_energy;

//time series record
var data_x = [];
var data_y = [];
var data_z = [];
var data_vx = [];
var data_vy = [];
var data_vz = [];
var data_kinetic = [];
var data_potential = [];
var data_energy = [];


//track
var trajectory = [];

//pause var
var restartFlag = false; //restart
var stopFlag = true;

var Ball = function(parameter) {

    this.radius = parameter.radius;
    this.mass = parameter.mass;

    this.x = parameter.x;
    this.y = parameter.y;
    this.z = parameter.z;

    this.vx = parameter.vx;
    this.vy = parameter.vy;
    this.vz = parameter.vz;

    this.x_1;
    this.y_1;
    this.z_1;
    //start position calculate
    this.calculateInitialCondition(dt);

    data_x = [];
    data_y = [];
    data_z = [];
    data_vx = [];
    data_vy = [];
    data_vz = [];
    data_kinetic = [];
    data_potential = [];
    data_energy = [];

    data_x.push([0, this.x]);
    data_y.push([0, this.y]);
    data_z.push([0, this.z]);
    data_vx.push([0, this.vx]);
    data_vy.push([0, this.vy]);
    data_vz.push([0, this.vz]);

    var energy = this.calculateEnergy();
    data_kinetic.push([0, energy.kinetic]);
    data_potential.push([0, energy.potential]);
    data_energy.push([0, energy.kinetic + energy.potential]);
};

Ball.prototype = {
    constructor: Ball,
    timeEvolution: function(dt) {

        f = this.calculateForce();

        //update the acceleration
        this.ax = f.x / this.mass;
        this.ay = f.y / this.mass;
        this.az = f.z / this.mass;

        //save the current time position
        var x_ = this.x;
        var y_ = this.y;
        var z_ = this.z;

        //the next time calculate（x_{n+1} = 2x_n - x_{n_1} + a_{n}\Delta t^2 ）
        this.x = 2 * this.x - this.x_1 + this.ax * dt * dt;
        this.y = 2 * this.y - this.y_1 + this.ay * dt * dt;
        this.z = 2 * this.z - this.z_1 + this.az * dt * dt;


        //function1: no relation between force and velocity
        this.vx = (this.x - this.x_1) / (2 * dt);
        this.vy = (this.y - this.y_1) / (2 * dt);
        this.vz = (this.z - this.z_1) / (2 * dt);

        //function2: force and velocity have relationship
        //var vx_ = this.vx;
        //var vy_ = this.vy;
        //var vz_ = this.vz;
        //v_n+1 = v_n-1 + 2 a_n deltat
        //this.vx = this.vx_1 + 2 * this.ax * dt;
        //this.vy = this.vy_1 + 2 * this.ay * dt;
        //this.vz = this.vz_1 + 2 * this.az * dt;

        //this.vx_1 = vx_;
        //this.vy_1 = vy_;
        //this.vz_1 = vz_;

        //in order to calculate the next time 「x_{n_1}」
        this.x_1 = x_;
        this.y_1 = y_;
        this.z_1 = z_;

        if (this.z < this.radius) {
            var tmp_z = this.z_1;
            this.z_1 = this.z;
            this.z = tmp_z;
        }
    },
    calculateForce: function() {

        var fx = 0;
        var fy = 0;
        var fz = -this.mass * g;

        return { x: fx, y: fy, z: fz };
    },
    //verlet init status calculation
    calculateInitialCondition: function(dt) {

        f = this.calculateForce();

        this.ax = f.x / this.mass;
        this.ay = f.y / this.mass;
        this.az = f.z / this.mass;
        //calculate the 「x_{-1}」
        this.x_1 = this.x - this.vx * dt + 1 / 2 * this.ax * dt * dt;
        this.y_1 = this.y - this.vy * dt + 1 / 2 * this.ay * dt * dt;
        this.z_1 = this.z - this.vz * dt + 1 / 2 * this.az * dt * dt;

        //v_-1
        //this.vx_1 = this.vx - this.ax * dt;
        //this.vy_1 = this.vy - this.ay * dt;
        //this.vz_1 = this.vz - this.az * dt;
    },
    calculateEnergy: function() {

        var v2 = this.vx * this.vx + this.vy * this.vy + this.vz * this.vz;

        var kinetic = 1 / 2 * this.mass * v2;

        var potential = this.mass * g * this.z_1;
        return { kinetic: kinetic, potential: potential };
    }
};

var ball = new Ball({
    radius: 30,
    mass: 1,
    x: 0,
    y: 0,
    z: 100,
    vx: 0,
    vy: 5,
    vz: 25
});

//jplot
function plotStart() {

    //position graph
    plot2D_position = new Plot2D("posPlotContent");

    plot2D_position.options.axesDefaults.tickOptions.formatString = '';
    plot2D_position.options.axes.xaxis.label = "time [s]"; //x axis label
    plot2D_position.options.axes.yaxis.label = "position [m]"; //y axis label
    plot2D_position.options.axes.yaxis.labelOptions = { angle: -90 };
    plot2D_position.options.axes.xaxis.min = 0; //min value
    plot2D_position.options.legend.show = true;
    plot2D_position.options.legend.location = 'ne';
    var series = [];
    series.push({
        showLine: true,
        label: "x axis",
        markerOptions: { show: true }
    });
    series.push({
        showLine: true,
        label: "y axis",
        markerOptions: { show: true }
    });
    series.push({
        showLine: true,
        label: "z axis",
        markerOptions: { show: true }
    });
    plot2D_position.options.series = series;
    console.log("position plot start.......");

    //velocity graph
    plot2D_velocity = new Plot2D("velPlotContent");

    plot2D_velocity.options.axesDefaults.tickOptions.formatString = '';
    plot2D_velocity.options.axes.xaxis.label = "time [s]";
    plot2D_velocity.options.axes.yaxis.label = "velocity [m/s]";
    plot2D_velocity.options.axes.yaxis.labelOptions = { angle: -90 };
    plot2D_velocity.options.axes.xaxis.min = 0;
    plot2D_velocity.options.legend.show = true;
    plot2D_velocity.options.legend.location = 'ne';
    var series = [];
    series.push({
        showLine: true,
        label: "vx",
        markerOptions: { show: true }
    });
    series.push({
        showLine: true,
        label: "vy",
        markerOptions: { show: true }
    });
    series.push({
        showLine: true,
        label: "vz",
        markerOptions: { show: true }
    });
    plot2D_velocity.options.series = series;
    console.log("velocity plot start.......");

    //energy graph
    plot2D_energy = new Plot2D("enerPlotContent");

    plot2D_energy.options.axesDefaults.tickOptions.formatString = '';
    plot2D_energy.options.axes.xaxis.label = "time [s]";
    plot2D_energy.options.axes.yaxis.label = "Energy [J]";
    plot2D_energy.options.axes.yaxis.labelOptions = { angle: -90 };
    plot2D_energy.options.axes.xaxis.min = 0;
    plot2D_energy.options.legend.show = true;
    plot2D_energy.options.legend.location = 'ne';
    var series = [];
    series.push({
        showLine: true,
        label: "kinetic",
        markerOptions: { show: true }
    });
    series.push({
        showLine: true,
        label: "potential",
        markerOptions: { show: true }
    });
    series.push({
        showLine: true,
        label: "energy",
        markerOptions: { show: true }
    });
    plot2D_energy.options.series = series;
    console.log("energy plot start.......");
}

//three.js
var stats;
var renderer, scene, canvasFrame, canvas;

function initThree() {

    //detect the envir of the browser
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    canvasFrame = document.getElementById('webglContent');

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasFrame.clientWidth, canvasFrame.clientHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;


    canvas = renderer.domElement;
    canvasFrame.appendChild(canvas);



    stats = new Stats();
    canvasFrame.appendChild(stats.dom);


    scene = new THREE.Scene();
}

var camera, trackball;
var clock = new THREE.Clock();

function initCamera() {

    camera = new THREE.PerspectiveCamera(45, canvasFrame.clientWidth / canvasFrame.clientHeight, 1, 10000);
    camera.position.set(1000, 0, 300);
    camera.up.set(0, 0, 1);
    camera.lookAt({ x: 0, y: 0, z: 100 });

    trackball = new THREE.TrackballControls(camera);

    trackball.screen.width = canvasFrame.clientWidth;
    trackball.screen.height = canvasFrame.clientHeight;
    trackball.screen.offsetLeft = canvasFrame.getBoundingClientRect().left;
    trackball.screen.offsetTop = canvasFrame.getBoundingClientRect().top;

    trackball.noRotate = false;
    trackball.rotateSpeed = 2.0;

    trackball.noZoom = false;
    trackball.zoomSpeed = 0.5;

    trackball.noPan = false;
    trackball.panSpeed = 0.6;
    trackball.target = new THREE.Vector3(0, 0, 100);

    trackball.staticMoving = true;
    trackball.dynamicDampingFactor = 0.3;

}

var directionalLight, ambientLight;

function initLight() {

    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);
    directionalLight.position.set(100, 100, 1000);
    directionalLight.castShadow = true;
    directionalLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 10, 2500));
    directionalLight.shadow.bias = 0.0001;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 1024;

    scene.add(directionalLight);

    ambientLight = new THREE.AmbientLight(0x777777);
    scene.add(ambientLight);
}

var sphere;

function initObject() {

    var geometry = new THREE.SphereGeometry(ball.radius, 20, 20);
    var material = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(ball.x, ball.y, ball.z);
    sphere.castShadow = true;
    sphere.castShadow = true;
    scene.add(sphere);

    trajectory.push(new THREE.Vector3(ball.x, ball.y, ball.z));


    var yuka_n = 20,
        yuka_w = 100;

    for (var i = -yuka_n / 2; i <= yuka_n / 2; i++) {
        for (var j = -yuka_n / 2; j <= yuka_n / 2; j++) {
            //pos
            var x = j * yuka_w;
            var y = i * yuka_w;

            geometry = new THREE.PlaneGeometry(yuka_w, yuka_w);

            if (Math.abs(i + j) % 3 == 0) {
                material = new THREE.MeshLambertMaterial({ color: 0x00CED1 });
            } else if (Math.abs(i + j) % 3 == 1) {
                material = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            } else if (Math.abs(i + j) % 3 == 2) {
                material = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
            }

            var plane = new THREE.Mesh(geometry, material);

            plane.position.set(x, y, 0);

            plane.castShadow = false;
            plane.receiveShadow = true;

            scene.add(plane);
        }
    }
}



function animate() {

    stats.update();
    trackball.update();
    update_param();
    requestAnimationFrame(animate);
}

function update_param() {


    var time = step * dt;
    if (stopFlag == false) {
        for (var k = 0; k < skip; k++) {
            step++;
            time = step * dt;
            ball.timeEvolution(dt);

            if (step % (skip * skip_data) == 0) {
                data_x.push([time, ball.x]);
                data_y.push([time, ball.y]);
                data_z.push([time, ball.z]);
                data_vx.push([time, ball.vx]);
                data_vy.push([time, ball.vy]);
                data_vz.push([time, ball.vz]);

                var energy = ball.calculateEnergy();
                data_kinetic.push([time, energy.kinetic]);
                data_potential.push([time, energy.potential]);
                data_energy.push([time, energy.kinetic + energy.potential]);
            }
        }
        trajectory.push(new THREE.Vector3(ball.x, ball.y, ball.z));
    }

    $('#time_elaspe').val(time.toFixed(2));

    sphere.position.set(ball.x, ball.y, ball.z);



    var trajectoryGeometry = new THREE.Geometry();
    trajectoryGeometry.vertices = trajectory;
    var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    var line = new THREE.Line(trajectoryGeometry, material);
    scene.add(line);

    if (restartFlag == true) {

        trajectory = [];
        step = 0;
        skip = 100;
        dt = 0.001;
        g = 9.8;

        var parameter = { radius: 30 };
        parameter.mass = parseFloat(document.getElementById("input_mass").value);
        parameter.x = parseFloat(document.getElementById("input_x").value);
        parameter.y = parseFloat(document.getElementById("input_y").value);
        parameter.z = parseFloat(document.getElementById("input_z").value);
        parameter.vx = parseFloat(document.getElementById("input_vx").value);
        parameter.vy = parseFloat(document.getElementById("input_vy").value);
        parameter.vz = parseFloat(document.getElementById("input_vz").value);

        ball = new Ball(parameter);

        restartFlag = false;
        stopFlag = false;

        $('#btn_start').text("restart");
    }

    if (stopFlag) {
        $('#btn_resume').text("resume");
    } else {
        $('#btn_resume').text("stop");
    }



    render();
    scene.remove(line);
}

function render() {

    renderer.clear();
    renderer.render(scene, camera);

}


function addScript() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML";
    document.getElementsByTagName("head")[0].appendChild(script);
}

function initEvent() {

    document.onmousemove = function(e) {
        e = e || window.event;
        x = e.clientX;
        y = e.clientY;

        if (x - canvas.getBoundingClientRect().left > 0 && x - canvas.getBoundingClientRect().left - canvas.width < 0 && y - canvas.getBoundingClientRect().top > 0 && y - canvas.getBoundingClientRect().top - canvas.height < 0) {
            trackball.enabled = true;
        } else {
            trackball.enabled = false;
        }
    };

    document.ontouchstart = function(e) {
        e = e || window.event;
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;

        if (x - canvas.getBoundingClientRect().left > 0 && x - canvas.getBoundingClientRect().left - canvas.width < 0 && y - canvas.getBoundingClientRect().top > 0 && y - canvas.getBoundingClientRect().top - canvas.height < 0) {
            trackball.enabled = true;
        } else {
            trackball.enabled = false;
        }
    };

    //init control param 
    var strs = ['x', 'y', 'z', 'vx', 'vy', 'vz'];
    for (var i = 0; i < strs.length; i++) {
        var axis = strs[i];
        var value = ball[axis];

        document.getElementById("input_" + axis).value = value;
        $('#slide_' + axis).slider({
            min: -100,
            max: 100,
            step: 1,
            value: value
        });

        $('#slide_' + axis).on("slide", function(slideEvt) {

            var id = this.id;
            var curAxis = id.replace("slide_", "");
            var curInput = id.replace("slide_", "input_");
            $('#' + curInput).val(slideEvt.value);
            ball[curAxis] = slideEvt.value;
        });
    }





    //bind button event
    document.getElementById("btn_start").addEventListener("click", function() {
        restartFlag = true;
    });

    document.getElementById("btn_resume").addEventListener("click", function() {
        if (stopFlag) {
            stopFlag = false;
        } else {
            stopFlag = true;
        }
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        if (e.target.id == 'pos-tab') {
            plot2D_position.clearData();

            plot2D_position.pushData(data_x);
            plot2D_position.pushData(data_y);
            plot2D_position.pushData(data_z);

            plot2D_position.linerPlot();
            stopFlag = true;
        } else if (e.target.id == 'vel-tab') {
            plot2D_velocity.clearData();

            plot2D_velocity.pushData(data_vx);
            plot2D_velocity.pushData(data_vy);
            plot2D_velocity.pushData(data_vz);

            plot2D_velocity.linerPlot();
            stopFlag = true;
        } else if (e.target.id == 'ene-tab') {
            plot2D_energy.clearData();

            plot2D_energy.pushData(data_kinetic);
            plot2D_energy.pushData(data_potential);
            plot2D_energy.pushData(data_energy);

            plot2D_energy.linerPlot();
            stopFlag = true;
        }

    });


    console.log('init event...' + Math.random());
}



threeStart();
plotStart();
initEvent();