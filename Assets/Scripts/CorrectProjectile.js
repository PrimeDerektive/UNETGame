#pragma strict

var correctTarget : Transform;
var rb : Rigidbody;

function Start () {
	rb = GetComponent.<Rigidbody>();

	Invoke("CorrectPosition", 1.0);
}

function FixedUpdate(){
	if(correctTarget){
		var dirToTarget = (correctTarget.position - transform.position).normalized;
		transform.forward = Vector3.Lerp(transform.forward, dirToTarget, Time.deltaTime);
		rb.velocity = transform.forward * 30.0;
	}
}

function CorrectPosition(){
	correctTarget = GameObject.Find("EnemyPrefab").transform;
	//var correctPos = transform.position + transform.right * 5.0;
	//GetComponent.<Rigidbody>().position = correctPos;
}