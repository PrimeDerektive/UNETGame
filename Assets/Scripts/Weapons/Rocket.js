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
			CameraShakeManager.instance.Shake(Vector3(12, 9.0, 9.0), 2.0, transform.position);
			Instantiate(explosionPrefab, transform.position, transform.rotation);
			NetworkServer.Destroy(gameObject);
		}
	}

}