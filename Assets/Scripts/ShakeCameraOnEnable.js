#pragma strict

var shakeMagnitude : Vector3 = Vector3(12, 9, 9);
var shakeDuration : float = 2.0;

function OnEnable(){
	CameraShakeManager.instance.Shake(shakeMagnitude, shakeDuration, transform.position);
}