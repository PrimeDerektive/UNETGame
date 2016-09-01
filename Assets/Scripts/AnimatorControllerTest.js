#pragma strict

var maxSpeed : float = 3.0;
var dampTime : float = 0.2;
var isDroid : boolean = false;

//component references
var anim : Animator;

private var velocity : Vector3; 
private var lastPos : Vector3 = Vector3.zero;
private var lastForward : Vector3 = Vector3.zero;

function Start () {
	if(!anim) anim = GetComponent.<Animator>();
}

function FixedUpdate(){

	//calculate velocity from last frame
	velocity = (transform.position - lastPos)/Time.fixedDeltaTime;
	//convert to local space
	velocity = transform.InverseTransformDirection(velocity);

	//get angle between last forward and current forward
	var direction : float = Utilities.FindTurningAngle(transform.forward, lastForward);

	//droid players handle turning differently
	if(isDroid)
		direction = Utilities.FindTurningAngle(transform.forward, Camera.main.transform.forward);


	//set the direction in the animator
	anim.SetFloat("direction", direction);

	//cache the last frame's position	
	lastPos = transform.position;
	//cache last frames forward
	lastForward = transform.forward;

}

function Update () {

	//clamp both speeds to from -1 - 1
	var speedX = Mathf.Clamp(velocity.x/maxSpeed, -1.0, 1.0);
	var speedY = Mathf.Clamp(velocity.z/maxSpeed, -1.0, 1.0);

	//send the values to the animator
	anim.SetFloat("speedX", speedX, dampTime, Time.deltaTime);
	anim.SetFloat("speedY", speedY, dampTime, Time.deltaTime);

}