#pragma strict

var ragdollReplacement : GameObject;

var goToRagdoll : boolean = false;
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

	var newRagdoll = Instantiate(ragdollReplacement, transform.position, transform.rotation);

	var ragdollJoints : Transform[] = newRagdoll.GetComponentsInChildren.<Transform>();
	var currentJoints : Transform[] = GetComponentsInChildren.<Transform>();
 
	for(var i = 0; i < ragdollJoints.Length; i++)
	{
	    for(var q = 0; q < currentJoints.Length; q++)
	    {
	        if(currentJoints[q].name.CompareTo(ragdollJoints[i].name) == 0)
	        {
	            ragdollJoints[i].position = currentJoints[q].position;
	            ragdollJoints[i].rotation = currentJoints[q].rotation;
	            break;
	        }
	    }
	}

	gameObject.SetActive(false);

	/*
	simplePatrol.enabled = false;
	anim.enabled = false;
	agent.enabled = false;
	GetComponent.<CharacterController>().enabled = false;
	for(var rb : Rigidbody in ragdollRB){
		rb.isKinematic = false;
	}
	*/
}

