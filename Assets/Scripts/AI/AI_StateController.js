#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AI_StateController extends NetworkBehaviour{

	var target : GameObjectVar;

	@SyncVar(hook="OnSyncTargetUpdate")
	var syncTargetNetId : NetworkInstanceId;

	@SyncVar(hook="OnSyncStateUpdate")
	var syncState : String = "";

	//component references
	var stateMachine : StateMachine;
	var blackboard : Blackboard;
	var agent : NavMeshAgent;
	var anim : Animator;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		if(!stateMachine) stateMachine = GetComponent.<StateMachine>();
		if(!agent) agent = GetComponent.<NavMeshAgent>();
		if(!anim) anim = GetComponent.<Animator>();
		target = blackboard.GetGameObjectVar("target");
	}

	function OnStartServer(){
		//server evaluates state and determines transitions 10x per second
		InvokeRepeating("EvaluateState", 0.0, 0.1);
	}

	function OnStartClient(){
		if(!isServer){
			//not server clients must initialize SyncVar hooks
			OnSyncTargetUpdate(syncTargetNetId);
			OnSyncStateUpdate(syncState);
		}
	}

	function EvaluateState(){

		//store the current behaviour state
		var currentState = stateMachine.GetEnabledStateName();

		//store the current animation state
		var currentAnimState = anim.GetCurrentAnimatorStateInfo(0);

		switch(currentState){

			case "Idle":
				//we're only in the idle state if we have no target, so find one

				//get the first object we find with the Player tag
				var newTarget = GameObject.FindGameObjectWithTag("Player");

				//if we find one
				if(newTarget != null){
					//set the target on the server
					target.Value = newTarget;
					//set the syncTargetNetId SyncVar so the clients can find the target
					syncTargetNetId = newTarget.GetComponent.<NetworkIdentity>().netId;
					//we found a target, go to the seeking target state
					TransitionEvent("GoToSeekingTarget");
				}

			break;

			case "SeekingTarget":

				//check if we're within melee distance
				if(Vector3.Distance(target.transform.position, transform.position) <= agent.stoppingDistance){ //the 0.1 fixes a bug where he kept walking in place stuck on SeekingTarget
					//we're in melee range, go to the melee state
					TransitionEvent("GoToMeleeAttack");
				}

			break;

			case "MeleeAttack":

				//check if the target moved too far away for us to attack
				if(currentAnimState.IsName("Idle") && ! anim.IsInTransition(0) && Vector3.Distance(transform.position, target.transform.position) > agent.stoppingDistance){
					TransitionEvent("GoToSeekingTarget");
				}

			break;

		}

	}

	function TransitionEvent(eventName : String){
		blackboard.SendEvent(eventName);
		syncState = eventName;
	}

	//SyncVar hook
	function OnSyncTargetUpdate(newsyncTargetNetId : NetworkInstanceId){
		if(isServer) return;
		//set the blackboard target variable to the object we find with the netId
		var newTarget = ClientScene.FindLocalObject(newsyncTargetNetId);

		//if our current target value (this includes null) doesn't equal the new target
		if(target.Value != newTarget)
			target.Value = newTarget;

	}

	private var lastSyncState : String;

	//SyncVar hook
	function OnSyncStateUpdate(newState : String){
		if(isServer) return;
		if(newState == lastSyncState) return;
		syncState = newState;
		//we found a target, transition to next state
		blackboard.SendEvent(newState);
		lastSyncState = syncState;
	}

}