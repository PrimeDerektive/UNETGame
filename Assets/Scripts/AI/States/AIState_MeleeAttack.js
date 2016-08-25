#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AIState_MeleeAttack extends NetworkBehaviour{

	var rotSpeed : float = 4.0;
	var attackAngle : float = 30.0;
	var target : GameObjectVar;
	var trailEffect : TrailRenderer;
	var soundWhoosh : AudioClip;
	var soundHit : AudioClip;

	//component references
	var anim : Animator;
	var blackboard : Blackboard;
	var agent : NavMeshAgent;
	var audioSource : AudioSource;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		if(!anim) anim = GetComponent.<Animator>();
		if(!agent) agent = GetComponent.<NavMeshAgent>();
		if(!audioSource) audioSource = GetComponent.<AudioSource>();
		target = blackboard.GetGameObjectVar("target");
		trailEffect.enabled = false;
	}

	function OnEnable(){
		Debug.Log("Now we're in the melee attack state.");
	}

	function Update(){

		//smoothly rotate towards target
		var targetPos = target.transform.position;
		targetPos.y = transform.position.y; //kill Y
		var targetRot = Quaternion.LookRotation(targetPos - transform.position);
		transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, Time.deltaTime * rotSpeed);

		//calculate angle difference between forward and dir to target
		var angleDifference = Vector3.Angle(transform.forward, targetPos - transform.position);
		var currentAnimState = anim.GetCurrentAnimatorStateInfo(0);

		//if we're not attacking and we're within attack angle, and we're still within attack distance
		if(currentAnimState.IsName("Idle") && angleDifference <= attackAngle && Vector3.Distance(transform.position, targetPos) < agent.stoppingDistance){
			anim.SetTrigger("Melee Attack 01");
		}

	}

	//animation event
	function StartMeleeAttack(){
		trailEffect.enabled = true;
	}

	//animation event
	function PlayMeleeWhoosh(){
		audioSource.PlayOneShot(soundWhoosh, 1.0);
	}

	//animation event
	function MeleeHit(){
		audioSource.PlayOneShot(soundHit, 1.0);
	}

	//animation event
	function EndMeleeAttack(){
		trailEffect.enabled = false;
	}

	function OnDisable(){
		trailEffect.enabled = false;
	}

}