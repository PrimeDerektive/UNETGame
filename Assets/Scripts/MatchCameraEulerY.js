#pragma strict

var aimTarget : Transform;

function LateUpdate () {
	var dirToAimTarget = aimTarget.position - transform.position;
	dirToAimTarget.y = transform.forward.y; //kill Y so we only rotate on Y axis
	transform.forward = dirToAimTarget;
}