
@NetworkSettings(channel=1, sendInterval=0.1)
public class WeaponController extends NetworkBehaviour{

	var weapons : Weapon[];
	var activeWeapon : Weapon;

	//@SyncVar(hook="OnFiringUpdate")
	public var firing : boolean = false;

	private var nextFireAllowed : float = 0.0;

	function Start(){
		activeWeapon = weapons[0];
	}

	function Update(){

		//only the local player controls input
		if(isLocalPlayer){
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

		if(firing && Time.time > nextFireAllowed){
			Fire();
			nextFireAllowed = Time.time + activeWeapon.fireRate;
		}

	}

	//owner tells server when his firing var changes
	@Command(channel=1)
	function CmdUpdateFiring(newFiringValue : boolean){
		//TODO: play falloff sound here for remote clients
		firing = newFiringValue;
	}

	function Fire(){

	}

}