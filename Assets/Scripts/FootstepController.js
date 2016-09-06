#pragma strict

var leftFoot : Transform;
var rightFoot : Transform;
var leftFootGrounded : boolean = true;
var rightFootGrounded : boolean = true;

var rayDistance : float = 2.0;
var footstepEffect : GameObject;
var groundLayer : LayerMask;
var groundOffset : float = 1.0;
var minTimeBetweenSteps = 0.5;

var delayStart : float = 0.0;

private var nextStepAllowed : float = 0.0;

function Start(){
	nextStepAllowed = Time.time + delayStart;
}

function LateUpdate(){

	//cast the hitscan ray
	var hit : RaycastHit;

	if(Physics.Raycast(leftFoot.position, -Vector3.up, hit, rayDistance, groundLayer)){
		if(!leftFootGrounded && Time.time > nextStepAllowed){
			nextStepAllowed = Time.time + minTimeBetweenSteps;
			Instantiate(footstepEffect, hit.point + Vector3.up * groundOffset, Quaternion.LookRotation(hit.normal));
			leftFootGrounded = true;
		}
	}
	else{
		leftFootGrounded = false;
	}

	if(Physics.Raycast(rightFoot.position, -Vector3.up, hit, rayDistance, groundLayer)){
		if(!rightFootGrounded && Time.time > nextStepAllowed){
			nextStepAllowed = Time.time + minTimeBetweenSteps;
			Instantiate(footstepEffect, hit.point + Vector3.up * groundOffset, Quaternion.LookRotation(hit.normal));
			rightFootGrounded = true;
		}
	}
	else{
		rightFootGrounded = false;
	}

}
