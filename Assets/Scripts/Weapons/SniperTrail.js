#pragma strict

var startPoint : Vector3 = Vector3.zero;
var endPoint : Vector3 = Vector3.zero;
var lr : LineRenderer;

private var timer : float = 0.0;

function Awake(){
	lr = GetComponent.<LineRenderer>();
}

function Update(){
	if(startPoint != Vector3.zero){
		startPoint += Vector3.up * Time.deltaTime * 3.0;
		endPoint += Vector3.up * Time.deltaTime * 3.0;
		lr.SetPosition(0, startPoint);
		lr.SetPosition(1, endPoint);
	}
}

function SetDistance(distance : float){
	startPoint = transform.position;
	endPoint = transform.position + transform.forward * distance;
}