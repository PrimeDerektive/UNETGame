#pragma strict

var goToRagdoll : boolean = false;
var rootRB : Rigidbody;

private var ragdollRB : Rigidbody[];
private var ragdolled : boolean = false;

var simplePatrol : SimplePatrol;
var anim : Animator;
var agent : NavMeshAgent;

function Awake () {
	ragdollRB = GetComponentsInChildren.<Rigidbody>();
	for(var rb : Rigidbody in ragdollRB){
		rb.isKinematic = true;
	}
	if(!simplePatrol) simplePatrol = GetComponent.<SimplePatrol>();
	if(!anim) anim = GetComponent.<Animator>();
	if(!agent) agent = GetComponent.<NavMeshAgent>();
}

function Update(){
	if(goToRagdoll && !ragdolled){
		GoToRagdoll();
		ragdolled = true;
	}
}

function GoToRagdoll(){
	anim.enabled = false;
	GetComponent.<CharacterController>().enabled = false;
	for(var rb : Rigidbody in ragdollRB){
		rb.isKinematic = false;
	}

}

