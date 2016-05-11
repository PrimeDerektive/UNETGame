#pragma strict

function OnEnable(){
	transform.Rotate(0.0, 0.0, Random.Range(0.0, 360.0));
}