#pragma strict
import RootMotion.FinalIK;
import UnityEngine.Networking;

public class GiantRocketController extends NetworkBehaviour{

	//aiming vars
	var aimTarget : Transform;
	var aimedArmTransform : Transform;
	var aimUpSound : AudioClip;
	var aimDownSound : AudioClip;

	//laser bolt vars
	var barrel : Transform;
	var muzzleFlash : ParticleSystem;
	var maxLaserBoltAmmo : int = 10;
	var currentLaserBoltAmmo : int = maxLaserBoltAmmo;
	var laserBoltFireRate : float = 0.5;
	var laserBoltRechargeRate : float = 5.0;
	var laserBoltProjectile : GameObject;
	var laserBoltFireSound : AudioClip;

	private var nextLaserBoltFireAllowed : float = 0.0;
	private var rechargingLaserBolt : boolean = false;
	private var currentRechargingLaserBolt : float = 0.0;

	//spawner vars
	var spawnerProjectile : GameObject;
	var spawnerLayer : LayerMask;
	var fireSpawnerSound : AudioClip;
	var cantFireSpawnerSound : AudioClip;
	var spawnerPrefab : GameObject;
	var spawnerCooldown : float = 15.0;
	var currentSpawnerCooldown : float = 0.0;

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
				CmdStartAiming();
			}

			if(Input.GetButtonUp("Fire2") && aiming){
				StartCoroutine("StopAiming");
				CmdStopAiming();
			}

			if(Input.GetButtonDown("Fire1") && aiming && currentLaserBoltAmmo > 0 && Time.time > nextLaserBoltFireAllowed){
				StartCoroutine(FireLaserBolt());
				CmdFireLaserBolt();
			}

			if(Input.GetButtonDown("Fire3") && aiming && currentSpawnerCooldown <= 0.0){
				FireSpawner();
			}

		}

		if(isLocalPlayer || isServer){

			if(currentLaserBoltAmmo < maxLaserBoltAmmo && !rechargingLaserBolt){
				StartCoroutine(RechargeLaserBolt());
			}

		}

		barrel.LookAt(aimTarget.position);

	}

	@Command
	function CmdStartAiming(){
		StartAiming();
		RpcStartAiming();
	}

	@Command
	function CmdStopAiming(){
		StartCoroutine("StopAiming");
		RpcStopAiming();
	}

	@ClientRpc
	function RpcStartAiming(){
		if(isLocalPlayer) return;
		StartAiming();
	}

	@ClientRpc
	function RpcStopAiming(){
		if(isLocalPlayer) return;
		StartCoroutine("StopAiming");
	}

	@Command
	function CmdFireLaserBolt(){
		//make sure the player isn't cheating
		if(!aiming || currentLaserBoltAmmo <= 0 || Time.time < nextLaserBoltFireAllowed) return;
		RpcFireLaserBolt();
	}

	@ClientRpc
	function RpcFireLaserBolt(){
		//local player already simulated with client side prediction
		if(isLocalPlayer) return;
		StartCoroutine(FireLaserBolt());
	}

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

	function FireLaserBolt(){

		yield WaitForEndOfFrame(); //fixes a bug with FinalIK

		muzzleFlash.Play();

		if(isServer){
			//instantiate the new projectile
			var newLaserBoltProjectile : GameObject = Instantiate(
				laserBoltProjectile,
				barrel.position,
				barrel.rotation);

			//REFACTOR THIS
			newLaserBoltProjectile.GetComponent.<Rocket>().creator = transform;

			//spawn it across the network
			NetworkServer.Spawn(newLaserBoltProjectile);

		}

		audioSource.PlayOneShot(laserBoltFireSound, 1.0);

		//only the server and the owner count ammo and enforce fire rate
		if(isServer || isLocalPlayer){
			currentLaserBoltAmmo--;
			nextLaserBoltFireAllowed = Time.time + laserBoltFireRate;

			//estimate transit time on the server,
			//if the server is not this player
			if(isServer && !isLocalPlayer){
				//get the transit time of this RPC
				var transitTime = Utilities.GetTransitTime(connectionToClient);
		        //subtract the transit time from the fire rate
		        nextLaserBoltFireAllowed -= transitTime;
			}

		}


	}

	function RechargeLaserBolt(){
		rechargingLaserBolt = true;

		//reset current recharge timer to 0
		currentRechargingLaserBolt = 0.0;

		//estimate transit time on the server,
		//if the server is not this player
		if(isServer && !isLocalPlayer){
			//get the transit time of this RPC
			var transitTime = Utilities.GetTransitTime(connectionToClient);
	        //subtract the transit time from the cooldown
	        currentRechargingLaserBolt += transitTime;
		}

		while(currentRechargingLaserBolt < laserBoltRechargeRate){
			currentRechargingLaserBolt += Time.deltaTime;
			yield;
		}
		currentLaserBoltAmmo++;
		rechargingLaserBolt = false;
	}

	function FireSpawner(){

		//check if we can fire a spawner
		var canFireSpawner : boolean = false;
		//first we make sure we're on the ground
		if(Physics.Raycast(aimTarget.position + Vector3.up, -Vector3.up, 2.0, spawnerLayer)){
			//then we make sure nothing is in the way
			if(!Physics.CheckCapsule((aimTarget.position + Vector3.up), aimTarget.position + Vector3.up * 2.0, 0.75)){
				//we can safely fire a spawner
				canFireSpawner = true;
			}
		}

		if(canFireSpawner){

			StartCoroutine(SpawnerCooldown());

			audioSource.PlayOneShot(fireSpawnerSound, 1.0);

			var newSpawnerProjectile : GameObject = Instantiate(
				spawnerProjectile,
				barrel.position,
				Quaternion.LookRotation(Vector3.up));

			var flareScript = newSpawnerProjectile.GetComponent.<SpawnerFlare>();
			flareScript.origin = barrel.position;
			flareScript.destination = aimTarget.position;

			//spawn it across the network
			NetworkServer.Spawn(newSpawnerProjectile);
			
			//var spawnerTravelTime = Vector3.Distance(barrel.position, aimTarget.position)/250.0 * 2.0;
			//iTween.MoveTo(newSpawnerProjectile, aimTarget.position, spawnerTravelTime);
			//schedule the replacement with the "real" spawner to happen when the projectile arrives
			//StartCoroutine(ReplaceSpawner(newSpawnerProjectile, spawnerTravelTime, aimTarget.position));

		}
		else{
			audioSource.PlayOneShot(cantFireSpawnerSound, 1.0);
		}


	}

	function SpawnerCooldown(){
		//reset current spawner cooldown
		currentSpawnerCooldown = spawnerCooldown;

		//estimate transit time on the server,
		//if the server is not this player
		if(isServer && !isLocalPlayer){
			//get the transit time of this RPC
			var transitTime = Utilities.GetTransitTime(connectionToClient);
	        //subtract the transit time from the cooldown
	        currentSpawnerCooldown -= transitTime;
		}

		while(currentSpawnerCooldown >= 0.0){
			currentSpawnerCooldown -= Time.deltaTime;
			yield;
		}
	}

	function TweenIKWeight(newValue : float){
		fbbik.solver.rightHandEffector.positionWeight = newValue;
		fbbik.solver.rightHandEffector.rotationWeight = newValue;
	}

	function TweenIKPosition(newValue : Vector3){
		fbbik.solver.rightHandEffector.position = newValue;
	}

	function OnGUI(){
		if(isLocalPlayer){

			//laser bolts gui
			GUI.Label(Rect (Screen.width - 160, 40, 150, 30), "Laser Bolt Ammo: " + currentLaserBoltAmmo.ToString());
			if(rechargingLaserBolt){
				GUI.Label(Rect (Screen.width - 160, 80, 150, 30), "Next Bolt Available: " + currentRechargingLaserBolt.ToString("F1"));
			}

			//spawner gui
			if(currentSpawnerCooldown <= 0.0){
				GUI.Label(Rect (Screen.width - 160, 120, 150, 30), "Spawner Available");
			}
			else{
				GUI.Label(Rect (Screen.width - 160, 120, 150, 30), "Spawner Cooldown: " + currentSpawnerCooldown.ToString("F1"));
			}


		}
	}

}