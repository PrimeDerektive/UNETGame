#pragma strict

var startPoint : Vector3 = Vector3.zero;
var endPoint : Vector3 = Vector3.zero;
var lr : LineRenderer;

private var timer : float = 0.0;

function Awake(){
	lr = GetComponent.<LineRenderer>();
}

function OnEnable(){
     iTween.FadeTo(gameObject, { "alpha": 0, "time": 1.0, "namedColorValue": "_TintColor" });
}

function Update(){
	if(startPoint != Vector3.zero){
		startPoint += Vector3.up * Time.deltaTime * 2.0;
		endPoint += Vector3.up * Time.deltaTime * 2.0;
		lr.SetPosition(0, startPoint);
		lr.SetPosition(1, endPoint);
	}
}

function SetDistance(distance : float){
	startPoint = transform.position;
	endPoint = transform.position + transform.forward * distance;
}