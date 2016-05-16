#pragma strict

static var instance : CameraShakeManager;

var maxDistance : float = 100.0;

private var lastShakeMagnitude : float = 0.0;
private var lastShakeFinished : float = 0.0;

private var cam : GameObject;

function Start () {
	instance = this;
	cam = Camera.main.gameObject;
}

function Shake(amount : Vector3, duration : float, origin : Vector3){

	//reduce shake amount and duration based on distance from camera
	var distanceFromCamera = Vector3.Distance(origin, cam.transform.position);

	//for use in lerp, clamp from 0 to 1
	var distanceModifier = Mathf.Clamp((maxDistance - distanceFromCamera)/maxDistance, 0, 1.0);
	
	//modify the shake amount exponentially
	amount *= distanceModifier*distanceModifier;

	//modify the duration linearly
	duration *= distanceModifier;

	Debug.Log("Amount: "+ amount +" duration: "+ duration);

	//exit if resulting amount is 0 or less
	if(amount.magnitude <= 0.0) return;

	//only shake if the last shake is over, or the new shake is bigger than the last shake
	if(Time.time > lastShakeFinished || amount.magnitude >= lastShakeMagnitude){
		StartCoroutine(DoShake(amount, duration));
		lastShakeMagnitude = amount.magnitude;
		//var lastShakeElapsed = lastShakeFinished - Time.time;
		//var currentShakeMagnitude = lastShakeElapsed/duration;
		lastShakeFinished = Time.time + duration*0.25;
	}

}

function DoShake(amount : Vector3, duration : float){
	iTween.Stop(cam);
	yield;
	cam.transform.localRotation = Quaternion.identity;
	iTween.PunchRotation(cam, amount, duration);
}