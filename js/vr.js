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
var flag = 0;

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
					global_speed.push(speed[i]);


			    }

			});


		});

			if (i > 31) { flag = 1};

	}
	var h_speed = 0.003;
	global_speed = [h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed,h_speed,-h_speed]
	var geo = new THREE.TetrahedronGeometry( 1, 0 );

	var start = Date.now();

	var xgrid = 14,
		ygrid = 9,
		zgrid = 14;
/*
	nobjects = xgrid * ygrid * zgrid;

	c = 0;

	//var s = 0.25;
	var s = 60;

	for ( i = 0; i < xgrid; i ++ )
	for ( j = 0; j < ygrid; j ++ )
	for ( k = 0; k < zgrid; k ++ ) {

		if ( singleMaterial ) {

			mesh = new THREE.Mesh( geo, zmaterial );

		} else {

			materials[ c ] = new THREE.MeshBasicMaterial( parameters );
			mesh = new THREE.Mesh( geo, materials[ c ] );
			//mesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial({color:0x4b4b4b, shading: THREE.FlatShading}) );

		}

		x = 200 * ( i - xgrid/2 );
		y = 200 * ( j - ygrid/2 );
		z = 200 * ( k - zgrid/2 );

		mesh.position.set( x, y, z );
		mesh.scale.set( s, s, s );

		mesh.matrixAutoUpdate = false;
		mesh.updateMatrix();

		scene.add( mesh );
		objects.push( mesh );

		c ++;

	}
*/
	//console.log("init time: ", Date.now() - start );

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

	window.addEventListener( 'resize', onWindowResize, false );

	var effectController  = {

		focus: 		0.55,
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

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	width = window.innerWidth;
	height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( width, height );
	postprocessing.composer.setSize( width, height );

}

function initPostprocessing() {
	var renderPass = new THREE.RenderPass( scene, camera );

	var bokehPass = new THREE.BokehPass( scene, camera, {
		focus: 		0.55,
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

	if (flag == 1) {
		for ( var i = 0; i < 32; i += 1 ) {

						global_head[i].rotation.y += global_speed[i];
						console.log(i);

		}
	}

	render();
	stats.update();

}

function render() {


	console.log('Flag status:',flag);

	postprocessing.composer.render( 0.1 );

}