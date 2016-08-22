#pragma strict
import UnityEngine.Networking;

public class Weapon_HitscanWeapon extends Weapon_Base{

	//hitscan vars
	var range : float;
	var layerMask : LayerMask;

	var hitEffectRobot : GameObject;
	var hitEffectLevel : GameObject;

	function Fire(){

		//point the active weapon's barrel at the aimTarget
		barrel.LookAt(aimTarget);

		//enable the muzzle flash
		StartCoroutine("EnableMuzzleFlash");

		//play the shot sound
		audioSource.pitch = Random.Range(0.85, 1.0);
		audioSource.PlayOneShot(fireSound, 0.5);

		//shake the camera
		CameraShakeManager.instance.Shake(shakeAmount, shakeDuration, barrel.position);

		//cast the hitscan ray
		var hit : RaycastHit;
		if(Physics.Raycast(barrel.position, barrel.forward, hit, range, layerMask)){
			if(hit.collider.gameObject.layer == LayerMask.NameToLayer("Hitbox")){
				hit.collider.gameObject.SendMessageUpwards("TakeDamage", 5.0, SendMessageOptions.DontRequireReceiver);
				Instantiate(hitEffectRobot, hit.point, Quaternion.LookRotation(hit.normal));
			}
			else{
				Instantiate(hitEffectLevel, hit.point, Quaternion.LookRotation(hit.normal));
			}
		}

	} //eof Fire()

}