#pragma strict

static var instance : CameraShakeManager;

private var lastShakeMagnitude : float = 0.0;
private var lastShakeFinished : float = 0.0;

private var cam : GameObject;

function Start () {
	instance = this;
	cam = Camera.main.gameObject;
}

function Shake(amount : Vector3, duration : float){
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