#pragma strict

public var fireRate : float = 0.33;
public var aimTarget : Transform;
public var barrel : Transform;
public var projectile : GameObject;

private var nextFireAllowed : float = 0.0;

public class Weapon_GrenadeThrow extends NetworkBehaviour{

	function Update () {

		if(isLocalPlayer){
			if(Input.GetButtonDown("Fire3") && Time.time > nextFireAllowed){
				CmdFire();
				nextFireAllowed = Time.time + fireRate;
			}
		}

	}

	@Command(channel=1)
	function CmdFire(){
		barrel.LookAt(aimTarget);
		var newProjectile  = GameObject.Instantiate(projectile, barrel.position, barrel.rotation);
		newProjectile.GetComponent.<Rigidbody>().velocity = barrel.forward * 10.0;
		NetworkServer.Spawn(newProjectile);
	}


}