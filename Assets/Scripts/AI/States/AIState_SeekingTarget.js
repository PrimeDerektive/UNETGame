#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AIState_SeekingTarget extends NetworkBehaviour{

	var rangedAttackDistance : float = 15.0;
	var rangedAttackChance : float = 0.25;
	var rangedAttackInterval : float = 3.0;
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
		InvokeRepeating("RangedCheck", rangedAttackInterval, rangedAttackInterval);
	}

	function Update(){

		//follow the target
		agent.SetDestination(target.transform.position);

		//check if we're within melee distance
		if(Vector3.Distance(target.transform.position, transform.position) <= agent.stoppingDistance){
			//we're in melee range, go to the melee state
			blackboard.SendEvent("InMeleeRange");
		}

	}

	function RangedCheck(){

		//only the server decides when the AI shoots
		if(!isServer)
			return;

		//if we're within ranged attack distance
		if(Vector3.Distance(transform.position, target.transform.position) <= rangedAttackDistance){

			//roll to see if we're going to do a ranged attack
			var rangedRoll : float = Random.value;
			Debug.Log(rangedRoll);
			if(rangedRoll <= rangedAttackChance){
				//do a ranged attack
				blackboard.SendEvent("DoRangedAttack");
				//tell clients to do a ranged attack
				RpcDoRangedAttack();
			}

		}

	}

	@ClientRpc
	function RpcDoRangedAttack(){
		blackboard.SendEvent("DoRangedAttack");
	}

	function OnDisable(){
		anim.SetBool("Walk", false);
		agent.enabled = false;
		CancelInvoke();
	}

}