#pragma strict
import UnityEngine.Networking;

public class SimplePatrol extends NetworkBehaviour{

	var waypoint1 : Transform;
	var waypoint2 : Transform;
	var target : Transform;

	private var agent : NavMeshAgent;

	function Start(){
		agent = GetComponent.<NavMeshAgent>();
		Debug.Log(GetComponent.<CharacterController>().bounds.size.magnitude);
	}

	function OnStartServer(){
		target = waypoint1;
	}

	function Update(){
		if(!isServer)
			return;
		
		if(agent.hasPath && agent.remainingDistance <= agent.stoppingDistance){
			if(target == waypoint1){
				target = waypoint2;
			}
			else{
				target = waypoint1;
			}
		}

		agent.SetDestination(target.position);
	}


}