#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AI_RequestTarget extends NetworkBehaviour{

	var target : GameObjectVar;

	//component references
	var blackboard : Blackboard;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		target = blackboard.GetGameObjectVar("target");
	}

	function OnStartClient(){
		CmdRequestTarget();
	}

	//called on the client, executed on the server
	@Command
	function CmdRequestTarget(){
		//currently sending this to all clients, hopefully refactor later to save bandwidth

		//get the target's net id
		var targetNetId = target.Value.GetComponent.<NetworkIdentity>().netId;

		//send it to the other players so they could find it
		RpcSetTarget(targetNetId);

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