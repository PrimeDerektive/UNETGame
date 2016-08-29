#pragma strict
import UnityEngine.Networking;
import UnityStandardAssets.Cameras;

@NetworkSettings(channel=1, sendInterval=0.1)
public class WeaponController extends NetworkBehaviour{

	var weapons : Weapon_Base[];
	var activeWeapon : Weapon_Base;

	private var camRig : FreeLookCam;
	private var cam : Camera;

	@SyncVar(hook="OnFiringUpdate")
	public var firing : boolean = false;

	private var nextFireAllowed : float = 0.0;

	function Start(){
		//select the first weapon for testing
		activeWeapon = weapons[0];
		camRig = GameObject.FindObjectOfType(FreeLookCam);
		cam = Camera.main;
	}

	function Update(){

		//only the local player controls input
		if(isLocalPlayer){

			if(activeWeapon.fireType == WeaponFireType.fullAuto){

				if(Input.GetButtonDown("Fire1") && !firing){
					firing = true;
					CmdUpdateFiring(firing);
				}

				if(Input.GetButtonUp("Fire1") && firing){
					firing = false;
					//GetComponent.<AudioSource>().PlayOneShot(falloffSound, 1.0);
					CmdUpdateFiring(firing);
				}

			}
			else if(activeWeapon.fireType == WeaponFireType.semiAuto){

				if(Input.GetButtonDown("Fire1") && Time.time > nextFireAllowed){
					StartCoroutine(Fire());
					CmdFire();
					nextFireAllowed = Time.time + activeWeapon.fireRate;
				}

			}

			//zoom handling
			if(Input.GetButton("Fire2")){
				camRig.m_TurnSpeed = Mathf.Lerp(camRig.m_TurnSpeed, 1.0, Time.deltaTime*5.0);
				cam.fieldOfView = Mathf.Lerp(cam.fieldOfView, 30.0, Time.deltaTime*5.0);
			}
			else{
				camRig.m_TurnSpeed = Mathf.Lerp(camRig.m_TurnSpeed, 5.0, Time.deltaTime*5.0);
				cam.fieldOfView = Mathf.Lerp(cam.fieldOfView, 60.0, Time.deltaTime*5.0);
			}
			
		}

		//this code is executed on all clients, both owner and remote
		//to trigger firing of active weapon if it is fullAuto
		if(firing && Time.time > nextFireAllowed && activeWeapon.fireType == WeaponFireType.fullAuto){
			StartCoroutine(Fire());
			nextFireAllowed = Time.time + activeWeapon.fireRate;
		}

	}

	//owner tells the server her fired his semi-auto weapon
	@Command(channel=1)
	function CmdFire(){
		//server tells the other clients to fire
		RpcFire();
	}

	//called on the server, executed on remote clients
	@ClientRpc(channel=1)
	function RpcFire(){
		//note a remote! I own this object, return
		if(isLocalPlayer) return;
		//call the fire function on the remote
		StartCoroutine(Fire());
	}

	//owner tells server when his firing var changes
	@Command(channel=1)
	function CmdUpdateFiring(newFiringValue : boolean){
		//TODO: play falloff sound here for remote clients when newFiringValue is false
		firing = newFiringValue;
	}

	//client side SyncVar callback
	function OnFiringUpdate(newFiringValue : boolean){
		//local player doesn't need to update firing because he did it himself
		//with client side prediction
		if(isLocalPlayer){
			return;
		}
		firing = newFiringValue;
	}

	//this is the general fire function for all weapons
	function Fire(){

		yield WaitForEndOfFrame();

		//call the active weapon's fire function
		activeWeapon.Fire();

		//if the active weapon is a projectile weapon, spawn the projectile if server
		var projectileWeapon  = activeWeapon as Weapon_ProjectileWeapon;
		if(projectileWeapon && isServer){

			//instantiate the new projectile
			var newProjectile : GameObject = Instantiate(
				projectileWeapon.projectile,
				projectileWeapon.barrel.position,
				projectileWeapon.barrel.rotation);

			//REFACTOR THIS
			newProjectile.GetComponent.<Rocket>().creator = transform;

			//spawn it across the network
			NetworkServer.Spawn(newProjectile);
		}

	}

}