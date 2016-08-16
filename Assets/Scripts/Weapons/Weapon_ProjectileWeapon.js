#pragma strict

public class Weapon_ProjectileWeapon extends Weapon_Base{
var projectile : GameObject;

	function Fire(){

		//point the active weapon's barrel at the aimTarget
		barrel.LookAt(aimTarget);

		//enable the muzzle flash
		StartCoroutine("EnableMuzzleFlash");

		//play the shot sound
		audioSource.pitch = Random.Range(0.85, 1.0);
		audioSource.PlayOneShot(fireSound, 1.0);

		//shake the camera
		CameraShakeManager.instance.Shake(shakeAmount, shakeDuration, barrel.position);

	} //eof Fire()

}