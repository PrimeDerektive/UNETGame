#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;
import System.Collections.Generic;

public class AIState_MeleeAttack extends NetworkBehaviour{

	var rotSpeed : float = 4.0;
	var attackAngle : float = 30.0;
	var attackRate : float = 1.0;
	var target : GameObjectVar;
	var trailEffect : TrailRenderer;

	var soundWhoosh : AudioClip;

	var groundHitLayerMask : LayerMask;
	var groundHitEffect : GameObject;

	var playerLayerMask : LayerMask;
	var playerHitEffect : GameObject;

	private var nextAttackAllowed : float;

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

		if(
			Time.time > nextAttackAllowed && 
			currentAnimState.IsName("Idle") &&
			angleDifference <= attackAngle &&
			Vector3.Distance(transform.position, targetPos) <= agent.stoppingDistance
		){
			DoMeleeAttack();
			nextAttackAllowed = Time.time + attackRate;
		}

	}

	function DoMeleeAttack(){
		anim.SetTrigger("Melee Attack 01");
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

		//raycast down from hand to determine if we should make a ground effect
		var hand = trailEffect.transform;
		var hit : RaycastHit;
		if(Physics.Raycast(hand.position + Vector3.up, -Vector3.up, hit, 10.0, groundHitLayerMask)){
			Instantiate(groundHitEffect, hit.point + Vector3.up * 0.1, Quaternion.LookRotation(Vector3.up));
		}
		
		//capsulecast to determine hit on players
		var alreadyHit = new List.<Transform>();
		var sphereRadius = 2.5;
		var sphereDir = transform.forward;
		var sphereOrigin = (transform.position + (Vector3.up * 2.0)) - sphereDir * sphereRadius;
		var hits : RaycastHit[] = Physics.SphereCastAll(
			sphereOrigin,
			sphereRadius,
			sphereDir,
			5.0,
			playerLayerMask
		);

		Debug.DrawRay(sphereOrigin, sphereDir * 5.0, Color.green, 1.0);

		for(hit in hits){
			if(!alreadyHit.Contains(hit.transform.root)){
				Instantiate(playerHitEffect, hit.point, Quaternion.LookRotation(Vector3.up));
				alreadyHit.Add(hit.transform.root);
			}
		}
		
	}

	//animation event
	function EndMeleeAttack(){
		trailEffect.enabled = false;
	}

	function OnDisable(){
		trailEffect.enabled = false;
	}

}