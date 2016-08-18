#pragma strict
import UnityEngine.Networking;

public class Idle extends NetworkBehaviour{

	//how often to try and find a target
	var findTargetInterval : float = 0.5;

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
			var newTargetNetId = newTarget.GetComponent.<NetworkIdentity>().netId;
			Debug.Log("Found a target: " + newTargetNetId);
		}

	}

	/*
	@ClientRpc
	function RpcSetTarget(){

	}
	*/

}