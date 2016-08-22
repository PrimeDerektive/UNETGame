#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AI_SyncTarget extends NetworkBehaviour{

	var target : GameObjectVar;

	@SyncVar(hook="OnTargetUpdate")
	var targetNetId : uint;

	//component references
	var blackboard : Blackboard;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		target = blackboard.GetGameObjectVar("target");
	}

	function OnStartServer(){
		InvokeRepeating("CheckTarget", 0.0, 0.5);
	}

	var lastTarget : GameObject;

	function CheckTarget(){
		//if we have a target
		if(target.Value){
			//only update the SyncVar value if the current
			//target is different from the last target
			if(lastTarget != target.Value){
				//set the syncvar to the target's netId
				targetNetId = target.Value.GetComponent.<NetworkIdentity>().netId.Value;
				Debug.Log(targetNetId);
			}
			lastTarget = target;
		}
	}

	//MOVE ALL THIS CODE TO ONSTARTCLIENT()
	//SyncVar hook
	function OnTargetUpdate(newTargetNetId : uint){
		//set the blackboard target variable to the object we find with the netId
		var newTarget = Utilities.FindNetworkObject(newTargetNetId).gameObject;
		Debug.Log(newTargetNetId);
		//var newTarget = ClientScene.FindLocalObject(newTargetNetId);

		//if our current target value (this includes null) doesn't equal the new target
		target.Value = newTarget;

		//we found a target, transition to next state
		blackboard.SendEvent("FoundTarget");
	}

}