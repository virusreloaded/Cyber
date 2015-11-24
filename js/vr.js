if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer,
	materials = [], objects = [],
	singleMaterial, zmaterial = [],
	parameters, i, j, k, h, color, x, y, z, s, n, nobjects,
	material_depth, cubeMaterial;

var mouseX = 0, mouseY = 0;

var head_mesh = [];
var global_head = [];
var speed = [];
var global_speed = [];
var geom = [];
var flag = 1;

var timeout_render = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var width = window.innerWidth;
var height = window.innerHeight;

var postprocessing = {};

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 70, width / height, 1, 3000 );
	camera.position.z = 30;
	camera.position.y = 0;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );
	renderer.setClearColor( 0x171717 );
	container.appendChild( renderer.domElement );

	renderer.sortObjects = false;

	material_depth = new THREE.MeshDepthMaterial();

	var light = new THREE.PointLight( 0xf3f3f3 );
	light.position.set(3000,3000,3000);
	light.castShadow = true;
	scene.add(light);

	var light2 = new THREE.PointLight( 0xf7f7f7 );
	light2.position.set(30,-30,-30);
	light2.castShadow = true;
	scene.add(light2);

	var light3 = new THREE.AmbientLight( 0xe9e9e9 );
	light3.castShadow = true;
	scene.add(light3);

	var path = "textures/cube/SwedishRoyalCastle/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls );

	parameters = { color: 0xff1100, envMap: textureCube, shading: THREE.FlatShading };

	var vrmaterial = new THREE.MeshPhongMaterial( {
		color: 0xffffff,
		specular:0xffffff,
		envMap: textureCube,
		combine: THREE.MultiplyOperation,
		shininess: 50,
		reflectivity: 1
	});

	var loader = new THREE.OBJLoader();


	for ( var i = 1; i < 33; i ++ ) {

			loader.load( 'obj/head/head-'+ i +'.obj', function ( object3d ) {


			object3d.traverse( function ( child ) {

			    if ( child.geometry !== undefined ) {

					geom[i] = child.geometry;

					head_mesh[i] = new THREE.Mesh( geom[i], vrmaterial );
					head_mesh[i].frustumCulled = false;

					//speed[i] = Math.random()*0.006-0.003;

					head_mesh[i].position.y = -175;

					//head_mesh[i].scale.y = 0.8;

					scene.add(head_mesh[i]);

					global_head.push(head_mesh[i]);


			    }

			});


		});


		if (i > 31) { flag = 0};

	}
	var h_speed = 0.004;
	global_speed = [h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed]
	scene.matrixAutoUpdate = false;

	initPostprocessing();

	renderer.autoClear = false;

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	window.addEventListener( 'resize', function() {
		var w = window.innerWidth,
			h = window.innerHeight;

		camera.aspect = w / h;
		camera.updateProjectionMatrix();

		renderer.setSize( w, h );
	}, false );

	var effectController  = {

		focus: 		1,
		aperture:	0.025,
		maxblur:	1.0

	};

	var matChanger = function( ) {

		postprocessing.bokeh.uniforms[ "focus" ].value = effectController.focus;
		postprocessing.bokeh.uniforms[ "aperture" ].value = effectController.aperture;
		postprocessing.bokeh.uniforms[ "maxblur" ].value = effectController.maxblur;

	};

	var gui = new dat.GUI();
	gui.add( effectController, "focus", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.add( effectController, "aperture", 0.001, 0.2, 0.001 ).onChange( matChanger );
	gui.add( effectController, "maxblur", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.close();

}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}
}

function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

}


function checkFlag() {

	if (flag == 1) { console.log('hi') }

	else if (flag == 0) { 
			for ( var j = 0; j < 32; j += 1 ) {
				
				if (global_head[j].rotation.y < 6.28 && global_head[j].rotation.y > -6.28) { global_head[j].rotation.y += global_speed[j] }

				else {
					timeout_render = 0;
					global_head[j].rotation.y = 0;
				}

			}
		}

}

function initPostprocessing() {
	var renderPass = new THREE.RenderPass( scene, camera );

	var bokehPass = new THREE.BokehPass( scene, camera, {
		focus: 		1,
		aperture:	0.025,
		maxblur:	1.0,

		width: width,
		height: height
	} );

	bokehPass.renderToScreen = true;

	var composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderPass );
	composer.addPass( bokehPass );

	postprocessing.composer = composer;
	postprocessing.bokeh = bokehPass;

}

function animate() {

	requestAnimationFrame( animate, renderer.domElement );

	//console.log(effectController.focus);

	timeout_render += 0.01;
	//console.log(timeout_render);

	if (timeout_render > 1) {
		checkFlag();
	}
	
	render();
	stats.update();

}

function render() {


	//console.log('Flag status:',flag);

	postprocessing.composer.render( 0.1 );

}