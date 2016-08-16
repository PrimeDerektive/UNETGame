#pragma strict

public class Weapon_Base extends MonoBehaviour{

	//emission vars
	var barrel : Transform;
	var aimTarget : Transform;

	//firing vars
	var fireType : WeaponFireType;
	var fireRate : float;
	var fireSound : AudioClip;

	//shake vars
	var shakeAmount : Vector3;
	var shakeDuration : float;

	//muzzle flash
	var muzzleFlash : GameObject;
	var muzzleFlashEffectsPrefab : GameObject;

	//component references
	var audioSource : AudioSource;

	function Awake(){
		audioSource = GetComponent.<AudioSource>();
	}

	function EnableMuzzleFlash() : IEnumerator{
		if(muzzleFlashEffectsPrefab){
			var newMuzzleFlashEffects = Instantiate(muzzleFlashEffectsPrefab, barrel.position, barrel.rotation);
			newMuzzleFlashEffects.transform.parent = barrel;
		}
		if(muzzleFlash){
			muzzleFlash.SetActive(true);
			yield WaitForSeconds(0.05);
			muzzleFlash.SetActive(false);
		}
	}

	function Fire(){
		Debug.Log("Firing "+ this.GetType().Name);
	}

}

/*
public enum WeaponFireType{
	fullAuto,
	semiAuto
}
*/
