﻿#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AIState_MeleeAttack extends NetworkBehaviour{

	var rotSpeed : float = 4.0;
	var attackAngle : float = 30.0;
	var target : GameObjectVar;

	//component references
	var anim : Animator;
	var blackboard : Blackboard;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		if(!anim) anim = GetComponent.<Animator>();
		target = blackboard.GetGameObjectVar("target");
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

		if(currentAnimState.IsName("Idle") && angleDifference <= attackAngle){
			anim.SetTrigger("Melee Attack 01");
		}
	}

	function OnDisable(){

	}

}