public class Weapon extends MonoBehaviour{

	var fireType : WeaponFireType;
	var projectileType : WeaponProjectileType;
	var projectile : GameObject;
	var shotSound : AudioClip;
	var muzzleFlash : GameObject;

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
