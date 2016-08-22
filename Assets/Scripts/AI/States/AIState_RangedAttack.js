#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

public class AIState_RangedAttack extends NetworkBehaviour{

	var rotSpeed : float = 4.0;
	var attackAngle : float = 45.0;
	var barrel1 : Transform;
	var barrel2 : Transform;
	var muzzleFlashPrefab : GameObject;
	var projectile : GameObject;
	var target : GameObjectVar;
	var startAttackSound : AudioClip;
	var stopAttackSound : AudioClip;

	//component references
	var anim : Animator;
	var audioSource : AudioSource;
	var blackboard : Blackboard;

	function Awake(){
		if(!blackboard) blackboard = GetComponent.<Blackboard>();
		if(!anim) anim = GetComponent.<Animator>();
		if(!audioSource) audioSource = GetComponent.<AudioSource>();
		target = blackboard.GetGameObjectVar("target");
	}

	function OnEnable(){
		Debug.Log("Now we're in the ranged attack state.");
		audioSource.PlayOneShot(startAttackSound, 1.0);
		Invoke("EndRangedAttack", Random.Range(3.0, 6.0));
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

		//if we're not attacking and we're within attack angle 
		if(!currentAnimState.IsName("Shoot Attack") && angleDifference <= attackAngle){
			anim.SetBool("Shoot Attack", true);
		}

	}

	private var lastBarrelUsed : Transform;

	function ShootEvent(){

		//use barrel1 unless it was the last used barrel
		var barrelToUse : Transform = barrel1;
		if(lastBarrelUsed == barrel1){
			//then use barrel2
			barrelToUse = barrel2;
		}

		//aim the barrel at the target
		barrelToUse.LookAt(target.transform.position + Vector3.up*0.75); 

		//instantiate the muzzle flash effect
		var muzzleFlash : GameObject = Instantiate(
			muzzleFlashPrefab,
			barrelToUse.position,
			barrelToUse.rotation);

		//instantiate the new projectile
		var newProjectile : GameObject = Instantiate(
			projectile,
			barrelToUse.position,
			barrelToUse.rotation);

		lastBarrelUsed = barrelToUse;

	}

	function EndRangedAttack(){
		blackboard.SendEvent("FINISHED");
	}	

	function OnDisable(){
		anim.SetBool("Shoot Attack", false);
		audioSource.PlayOneShot(stopAttackSound, 0.5);
	}

}