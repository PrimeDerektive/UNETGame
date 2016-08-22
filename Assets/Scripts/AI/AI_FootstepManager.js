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
	StartCoroutine(CreateFootstepEffect(leftFoot.position));
}

function FootstepRight(){
	audioSource.pitch = Random.Range(0.75, 1.0);
	audioSource.PlayOneShot(footstepClip, 0.5);
	StartCoroutine(CreateFootstepEffect(rightFoot.position));
}

function CreateFootstepEffect(pos : Vector3){
	yield WaitForSeconds(0.05);
	var newFootPuff = Instantiate(footstepEffect, pos, Quaternion.identity);
	newFootPuff.transform.forward = Vector3.up;
}
