#pragma strict
import RootMotion.FinalIK;
import UnityEngine.Networking;

public class GiantRocketController extends NetworkBehaviour{

	var aimTarget : Transform;
	var aimedArmTransform : Transform;
	var aimUpSound : AudioClip;
	var aimDownSound : AudioClip;

	var barrel : Transform;
	var muzzleFlash : ParticleSystem;
	var projectile : GameObject;
	var fireSound : AudioClip;

	var spawnerProjectile : GameObject;
	var spawnerLayer : LayerMask;
	var fireSpawnerSound : AudioClip;
	var cantFireSpawnerSound : AudioClip;

	var spawnerPrefab : GameObject;

	//component references
	var audioSource : AudioSource;
	var fbbik : FullBodyBipedIK;

	private var aiming : boolean = false;

	function Awake(){
		if(!audioSource) audioSource = GetComponent.<AudioSource>();
		if(!fbbik) fbbik = GetComponent.<FullBodyBipedIK>();
	}

	function Update () {

		//only the local player controls input
		if(isLocalPlayer){

			if(Input.GetButtonDown("Fire2") && !aiming){
				StartAiming();
			}

			if(Input.GetButtonUp("Fire2") && aiming){
				StartCoroutine("StopAiming");
			}

			if(Input.GetButtonDown("Fire1") && aiming){
				Fire();
			}

			if(Input.GetButtonDown("Fire3") && aiming){
				FireSpawner();
			}

		}

		barrel.LookAt(aimTarget.position);

	}

	/*

	@Command
	function CmdPunch(){
		//tell the clients he's punching
		RpcPunch();
	}

	@ClientRpc
	function RpcPunch(){
		if(isLocalPlayer) return;
		StartCoroutine(Punch());
	}
	*/

	function StartAiming(){
		aiming = true;

		fbbik.solver.rightHandEffector.target = aimedArmTransform;

		//aim the arm
		audioSource.PlayOneShot(aimUpSound, 1.0);
		iTween.ValueTo(gameObject, iTween.Hash("from",0, "to", 1.0, "time", 0.5, "onupdate","TweenIKWeight"));

	}

	function StopAiming(){
		iTween.Stop(gameObject);
		iTween.ValueTo(gameObject, iTween.Hash("from",fbbik.solver.rightHandEffector.positionWeight, "to", 0.0, "time", 0.5, "onupdate","TweenIKWeight"));
		audioSource.PlayOneShot(aimDownSound, 1.0);
		yield WaitForSeconds(0.5);
		fbbik.solver.rightHandEffector.target = null;
		aiming = false;

	}

	function Fire(){
		muzzleFlash.Play();

		if(isServer){
			//instantiate the new projectile
			var newProjectile : GameObject = Instantiate(
				projectile,
				barrel.position,
				barrel.rotation);

			//REFACTOR THIS
			newProjectile.GetComponent.<Rocket>().creator = transform;

			//spawn it across the network
			NetworkServer.Spawn(newProjectile);

		}

		audioSource.PlayOneShot(fireSound, 1.0);

	}

	function FireSpawner(){

		//check if we can fire a spawner
		var canFireSpawner : boolean = false;
		//first we make sure we're on the ground
		if(Physics.Raycast(aimTarget.position + Vector3.up, -Vector3.up, 2.0, spawnerLayer)){
			//then we make sure nothing is in the way
			if(!Physics.CheckCapsule((aimTarget.position + Vector3.up), aimTarget.position + Vector3.up * 2.0, 0.75)){
				//we can safely fire a spawn
				canFireSpawner = true;
			}
		}

		if(canFireSpawner){
			audioSource.PlayOneShot(fireSpawnerSound, 1.0);

			var newSpawnerProjectile : GameObject = Instantiate(
				spawnerProjectile,
				barrel.position,
				barrel.rotation);
			
			var spawnerTravelTime = Vector3.Distance(barrel.position, aimTarget.position)/250.0 * 2.0;
			iTween.MoveTo(newSpawnerProjectile, aimTarget.position, spawnerTravelTime);
			//schedule the replacement with the "real" spawner to happen when the projectile arrives
			StartCoroutine(ReplaceSpawner(newSpawnerProjectile, spawnerTravelTime, aimTarget.position));

		}
		else{
			audioSource.PlayOneShot(cantFireSpawnerSound, 1.0);
		}


	}

	function ReplaceSpawner(projectile : GameObject, delay : float, pos : Vector3){
		yield WaitForSeconds(delay);
		Destroy(projectile);
		if(isServer){
			var newSpawner : GameObject = Instantiate(
				spawnerPrefab,
				pos + Vector3.up * 0.1,
				Quaternion.LookRotation(Vector3.up));
			//spawn it across the network
			NetworkServer.Spawn(newSpawner);
		}
	}

	function TweenIKWeight(newValue : float){
		fbbik.solver.rightHandEffector.positionWeight = newValue;
		fbbik.solver.rightHandEffector.rotationWeight = newValue;
	}

	function TweenIKPosition(newValue : Vector3){
		fbbik.solver.rightHandEffector.position = newValue;
	}

}