#pragma strict

var aimTarget : Transform;
var range : float = 250.0;
var layerMask : LayerMask;

private var mainCam : Transform;

function Start(){
	mainCam = Camera.main.transform;
	aimTarget.parent = null;
}

function Update () {
	var hit : RaycastHit;
	if(Physics.Raycast(mainCam.position, mainCam.forward, hit, range, layerMask)){
		aimTarget.position = hit.point;
	}
	else{
		aimTarget.position = mainCam.position + mainCam.forward * range;
	}
}