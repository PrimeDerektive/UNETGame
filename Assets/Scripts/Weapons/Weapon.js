public class Weapon extends MonoBehaviour{

	var fireType : WeaponFireType;
	var projectileType : WeaponProjectileType;
	var fireRate : float;
	var barrel : Transform;
	var range : float;
	var shakeAmount : Vector3;
	var shakeDuration : float;
	var projectile : GameObject;
	var shotSound : AudioClip;
	var muzzleFlash : GameObject;
	var tracer : GameObject;

	function EnableMuzzleFlash() : IEnumerator{
		muzzleFlash.SetActive(true);
		yield WaitForSeconds(0.05);
		muzzleFlash.SetActive(false);
	}

}

public enum WeaponFireType{
	fullAuto,
	semiAuto,
	continuousFire
}

public enum WeaponProjectileType{
	hitscan,
	projectile
}
