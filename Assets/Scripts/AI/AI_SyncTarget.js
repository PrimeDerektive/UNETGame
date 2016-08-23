#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AI_SyncTarget extends NetworkBehaviour{

	var target : GameObjectVar;

	@SyncVar(hook="OnTargetUpdate")
	var targetNetId : NetworkInstanceId;

	//component references
	var blackboard : Blackboard;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		target = blackboard.GetGameObjectVar("target");
	}

	function OnStartServer(){
		InvokeRepeating("CheckTarget", 0.0, 0.5);
	}

	function OnStartClient(){
		//initialize state machine with initial syncvar value on clients
		if(!isServer)
			OnTargetUpdate(targetNetId);
	}

	var lastTarget : GameObject;

	function CheckTarget(){
		//if we have a target
		if(target.Value){
			//only update the SyncVar value if the current
			//target is different from the last target
			if(lastTarget != target.Value){
				//set the syncvar to the target's netId
				targetNetId = target.Value.GetComponent.<NetworkIdentity>().netId;
				Debug.Log(targetNetId);
			}
			lastTarget = target;
		}
	}

	//SyncVar hook
	function OnTargetUpdate(newTargetNetId : NetworkInstanceId){
		//set the blackboard target variable to the object we find with the netId
		var newTarget = ClientScene.FindLocalObject(newTargetNetId);

		//if our current target value (this includes null) doesn't equal the new target
		if(target.Value != newTarget)
			target.Value = newTarget;

		//we found a target, transition to next state
		blackboard.SendEvent("FoundTarget");
	}


}