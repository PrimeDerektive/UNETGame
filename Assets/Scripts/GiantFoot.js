#pragma strict

var rayDistance : float = 2.0;
var footstepEffect : GameObject;
var groundLayer : LayerMask;
var groundOffset : float = 1.0;
var minTimeBetweenSteps = 0.25;

var grounded : boolean = true;

private var nextStepAllowed : float = 0.0;

function LateUpdate(){

	//cast the hitscan ray
	var hit : RaycastHit;

	Debug.DrawRay(transform.position, -Vector3.up * rayDistance, Color.red);

	if(Physics.Raycast(transform.position, -Vector3.up, hit, rayDistance, groundLayer)){
		if(!grounded && Time.time > nextStepAllowed){
			nextStepAllowed = Time.time + minTimeBetweenSteps;
			Instantiate(footstepEffect, hit.point + Vector3.up * groundOffset, Quaternion.LookRotation(hit.normal));
			grounded = true;
		}
	}
	else{
		grounded = false;
	}

}
