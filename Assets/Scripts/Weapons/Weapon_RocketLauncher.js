#pragma strict

class Weapon_RocketLauncher extends Weapon{

	function EnableMuzzleFlash() : IEnumerator{

		var newMuzzleFlash = GameObject.Instantiate(muzzleFlash, barrel.position, barrel.rotation);
		newMuzzleFlash.transform.parent = barrel;
	}
	
}