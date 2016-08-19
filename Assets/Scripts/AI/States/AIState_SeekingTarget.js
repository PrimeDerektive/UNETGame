#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AIState_SeekingTarget extends NetworkBehaviour{

	var target : GameObjectVar;

	//component references
	var agent : NavMeshAgent;
	var anim : Animator;
	var blackboard : Blackboard;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		if(!agent) agent = GetComponent.<NavMeshAgent>();
		if(!anim) anim = GetComponent.<Animator>();
		agent.enabled = false;
		target = blackboard.GetGameObjectVar("target");
	}

	function OnEnable(){
		Debug.Log("Now we're in the seeking target state.");
		agent.enabled = true;
		anim.SetBool("Walk", true);
	}

	function Update(){
		agent.SetDestination(target.transform.position);
		if(agent.hasPath && agent.remainingDistance <= agent.stoppingDistance){
			blackboard.SendEvent("InMeleeRange");
		}
	}

	function OnDisable(){
		anim.SetBool("Walk", false);
		agent.enabled = false;
	}

}