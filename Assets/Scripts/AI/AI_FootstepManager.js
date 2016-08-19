#pragma strict

var leftFoot : Transform;
var rightFoot : Transform;
var footstepEffect : GameObject;
var footstepClip : AudioClip;

//component references
var audioSource : AudioSource;


function Start(){
	if(!audioSource) audioSource = GetComponent.<AudioSource>();
}

function FootstepLeft(){
	audioSource.pitch = Random.Range(0.75, 1.0);
	audioSource.PlayOneShot(footstepClip, 0.5);
	var newFootPuff = Instantiate(footstepEffect, leftFoot.position, Quaternion.identity);
	newFootPuff.transform.forward = Vector3.up;
}

function FootstepRight(){
	audioSource.pitch = Random.Range(0.75, 1.0);
	audioSource.PlayOneShot(footstepClip, 0.5);
	var newFootPuff = Instantiate(footstepEffect, rightFoot.position, Quaternion.identity);
	newFootPuff.transform.forward = Vector3.up;
}
