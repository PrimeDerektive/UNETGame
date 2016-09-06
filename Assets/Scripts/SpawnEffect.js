#pragma strict

var spawnEffect : GameObject;
var scaleDelay : float = 0.1;
var scaleDuration : float = 0.5;

//so we know what to scale to for the effect
private var startingScale : Vector3;

function Start(){
	startingScale = transform.localScale;
	transform.localScale = Vector3.zero;
	Instantiate(spawnEffect, transform.position, transform.rotation);
	yield WaitForSeconds(scaleDelay);
	iTween.ScaleTo(gameObject, startingScale, scaleDuration);
}
