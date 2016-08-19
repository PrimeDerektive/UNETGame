#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AIState_Idle extends NetworkBehaviour{

	//how often to try and find a target
	var findTargetInterval : float = 0.5;
	var target : GameObjectVar;

	//component references
	var blackboard : Blackboard;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		target = blackboard.GetGameObjectVar("target");
	}

	function OnEnable(){
		InvokeRepeating("FindTarget", 0.0, findTargetInterval);
	}

	function FindTarget(){

		//return if we're not the server
		if(!isServer)
			return;

		//get the first object we find with the Player tag
		var newTarget = GameObject.FindGameObjectWithTag("Player");

		//if we find one
		if(newTarget != null){
			//set the target on the server
			target.Value = newTarget;
			//get the targets netid
			var newTargetNetId = newTarget.GetComponent.<NetworkIdentity>().netId;
			//send it to the other players so they could find it
			RpcSetTarget(newTargetNetId);
			//we found a target, transition to next state
			blackboard.SendEvent("FoundTarget");
		}

	}

	//called on the server, executed on clients
	@ClientRpc
	function RpcSetTarget(newTargetNetId : NetworkInstanceId){
		//set the blackboard target variable to the object we find with the netId
		target.Value = ClientScene.FindLocalObject(newTargetNetId);
		//we found a target, transition to next state
		blackboard.SendEvent("FoundTarget");
	}

}