#pragma strict
import UnityEngine.Networking;

public class Rocket extends NetworkBehaviour{

	var initialVelocity : float = 30.0;
	var explosionPrefab : GameObject;
	var creator : Transform;
	private var rb : Rigidbody;

	function Start () {
		rb = GetComponent.<Rigidbody>();
		rb.velocity = transform.forward * initialVelocity;
	}

	function OnTriggerEnter(other : Collider) {
		if(isServer){
			if(other.transform.root == creator) return;
			CameraShakeManager.instance.Shake(Vector3(7.5, 5.0, 5.0), 1.5, transform.position);
			Instantiate(explosionPrefab, transform.position, transform.rotation);
			NetworkServer.Destroy(gameObject);
		}
	}

}