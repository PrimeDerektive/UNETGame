
@NetworkSettings(channel=1, sendInterval=0.1)
public class WeaponController extends NetworkBehaviour{

	var weapons : Weapon[];
	var activeWeapon : Weapon;
	var aimTarget : Transform;
	var layerMask : LayerMask; //the global layermask for what weapons can hit

	var testHitEffect : GameObject;

	@SyncVar(hook="OnFiringUpdate")
	public var firing : boolean = false;

	private var nextFireAllowed : float = 0.0;

	function Start(){
		//select the first weapon for testing
		activeWeapon = weapons[0];
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
					Fire();
					//CmdFire();
					nextFireAllowed = Time.time + activeWeapon.fireRate;
				}

			}
			
		}

		//this code is executed on all clients, both owner and remote
		//to trigger firing of active weapon if it is fullAuto
		if(firing && Time.time > nextFireAllowed && activeWeapon.fireType == WeaponFireType.fullAuto){
			Fire();
			nextFireAllowed = Time.time + activeWeapon.fireRate;
		}

	}

	//owner tells server when his firing var changes
	@Command(channel=1)
	function CmdUpdateFiring(newFiringValue : boolean){
		//TODO: play falloff sound here for remote clients when newFiringValue is false
		firing = newFiringValue;
	}

	//client side SyncVar callback
	function OnFiringUpdate(newFiringValue : boolean){
		//local plaer doesn't need to update firing because he did it himself
		//with client side prediction
		if(isLocalPlayer){
			return;
		}
		firing = newFiringValue;
	}

	//this is the general fire function for all weapons
	function Fire(){

		//point the active weapon's barrel at the aimTarget
		activeWeapon.barrel.LookAt(aimTarget);

		//enable the muzzle flash
		activeWeapon.StartCoroutine("EnableMuzzleFlash");

		//play the shot sound
		GetComponent.<AudioSource>().PlayOneShot(activeWeapon.shotSound, 1.0);

		//shake the camera
		CameraShakeManager.instance.Shake(Vector3(1.0, 0.33, 0.33), 0.5, activeWeapon.barrel.position);

		//if the active weapon is a hitscan weapon
		if(activeWeapon.projectileType == WeaponProjectileType.hitscan){

			//if the active weapon has a tracer, create it at the barrel coordinates and store a reference to its script
			if(activeWeapon.tracer){
				var tracer = GameObject.Instantiate(activeWeapon.tracer, activeWeapon.barrel.position, activeWeapon.barrel.rotation);
				//cache a reference to the tracer script
				var tracerScript = tracer.GetComponent.<SimpleBullet>();
			}

			//cast the hitscan ray
			var hit : RaycastHit;
			if(Physics.Raycast(activeWeapon.barrel.position, activeWeapon.barrel.forward, hit, activeWeapon.range, layerMask)){
				Instantiate(testHitEffect, hit.point, Quaternion.LookRotation(hit.normal));
				if(tracerScript) tracerScript.dist = hit.distance; //set the lifetime of the tracer
			}
			else{
				if(tracerScript) tracerScript.dist = activeWeapon.range; //set the lifetime of the tracer
			}
		}
		else if(activeWeapon.projectileType == WeaponProjectileType.projectile){

			if(isServer){
				activeWeapon.barrel.LookAt(aimTarget);
				var newProjectile  = GameObject.Instantiate(activeWeapon.projectile, activeWeapon.barrel.position, activeWeapon.barrel.rotation);
				newProjectile.GetComponent.<Rocket>().creator = this.transform;
				NetworkServer.Spawn(newProjectile);
			}

		}

	}

}