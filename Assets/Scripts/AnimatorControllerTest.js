#pragma strict

var maxSpeed : float = 3.0;
var dampTime : float = 0.2;

private var velocity : Vector3; 
private var anim : Animator;
private var lastPos : Vector3 = Vector3.zero;

function Start () {
	anim = GetComponent.<Animator>();
}

function FixedUpdate(){

	//calculate velocity from last frame
	velocity = (transform.position - lastPos)/Time.fixedDeltaTime;
	//convert to local space
	velocity = transform.InverseTransformDirection(velocity);

	//cache the last frame's position	
	lastPos = transform.position;

}

function Update () {

	//clamp both speeds to from -1 - 1
	var speedX = Mathf.Clamp(velocity.x/maxSpeed, -1.0, 1.0);
	var speedY = Mathf.Clamp(velocity.z/maxSpeed, -1.0, 1.0);

	//send the values to the animator
	anim.SetFloat("speedX", speedX, dampTime, Time.deltaTime);
	anim.SetFloat("speedY", speedY, dampTime, Time.deltaTime);

}