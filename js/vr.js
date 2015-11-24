window.onload = function() {
var renderer	= new THREE.WebGLRenderer({
	antialias	: true
});
renderer.setClearColor( 0x051E3D );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


var container, stats;
var camera, scene, renderer, particles, geometry0, geometry, geometry2, geometry3, geometry4, geometry5, geometry6, i, h, color, sprite, size;
var tmp_geometry0, tmp_geometry, tmp_geometry2, tmp_geometry3, tmp_geometry4, tmp_geometry5, tmp_geometry6;
var mouseX = 0, mouseY = 0;
var p = [];
var h;
var hue;
var vl = [];
var vt;
var vertices = [];
var vertex = [];
var ground = -160;
var assetsLoadedCount = 0;

var vertices_tmp = [];
var animVertices = [];
var geom = [];
var VertArray = [];
var ObjArray = [];
var material;
var Objects = [];
var delta = 0;
var newpoint = 60;
var cubev = [];
var cvl;
var vel =[];
var cvel =[];
var dvel =[];
var j = 0;
var kx = [],ky = [], kz = [];
var dt = 10000;
var rs;
var rotdeg;

var scene	= new THREE.Scene();
//scene.fog = new THREE.FogExp2( 0x070912, 0.001 );
var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.x = 15;
camera.position.z = 16;

//camera.lookAt(scene.position);
//controls = new THREE.OrbitControls( camera );
//controls.update();

window.addEventListener( 'resize', function() {
	var w = window.innerWidth,
		h = window.innerHeight;

	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize( w, h );
}, false );

//var light	= new THREE.AmbientLight( 0xffffff )
//scene.add( light )
// add a light in front
var light	= new THREE.DirectionalLight(0xffffff, 1)
light.position.set(-50, 50, 50)
scene.add( light )

var light2	= new THREE.PointLight(0xffffff, 1)
light2.position.set(18, 10, 0)
scene.add( light2 )
// add a light behind


//scene.fog	= new THREE.Fog( 0x15a5b3, 120, 200 );
scene.fog	= new THREE.Fog( 0x000000, 80, 120 );

var sprite = THREE.ImageUtils.loadTexture( "tex/binary.jpg" );
sprite.wrapS = THREE.RepeatWrapping;
sprite.wrapT = THREE.RepeatWrapping;
sprite.repeat.set( 4, 4 );

//var material = new THREE.MeshBasicMaterial( { map: sprite,  transparent: true } );


var geometry = new THREE.TorusGeometry( 20, 4, 100, 200 );
var material = new THREE.MeshPhongMaterial( { color: 0x0B3F7C, map: sprite, transparent: true } );
material.side = THREE.DoubleSide;
var torus = new THREE.Mesh( geometry, material );
torus.rotation.x = Math.PI/180*90;
torus.doubleSided = true;
scene.add( torus );

	animate();
	function animate() {

	requestAnimationFrame( animate );

	torus.rotation.z += 0.001;
		
	renderer.render( scene, camera );
	}


}