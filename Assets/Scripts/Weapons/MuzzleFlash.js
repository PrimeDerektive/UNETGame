#pragma strict

var aimTarget : Transform;
var tracerPrefab : GameObject;

function OnEnable(){
	//this needs to be a coroutine to introduce WaitForEndOfFrame(), its weird but necessary to fix a bug with FinalIK
	CreateTracer();
	//randomly rotate MuzzleFlash
	transform.Rotate(0.0, 0.0, Random.Range(0.0, 360.0));

}

function CreateTracer(){
	//instantiate tracers if they exist
	if(tracerPrefab){
		//instantiate the tracer prefab
		Instantiate(tracerPrefab, transform.position, transform.rotation);
	}
}