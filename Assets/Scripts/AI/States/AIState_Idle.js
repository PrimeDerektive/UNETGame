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


}