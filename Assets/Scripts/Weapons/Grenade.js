#pragma strict
import UnityEngine.Networking;

public class Grenade extends NetworkBehaviour{

	var lifeTime : float = 5.0;
	var explosionPrefab : GameObject;

	private var spawnTime : float = 0.0;

	function OnEnable () {
		Invoke("Explode", lifeTime);
		GetComponent.<Rigidbody>().AddForce(transform.forward * 750.0);
		GetComponent.<Rigidbody>().angularVelocity = Vector3(10.0, 0, 0);
	}


	function Explode(){
		if(isServer){
			NetworkServer.Destroy(gameObject);
		}
	}

	function OnNetworkDestroy(){
		var explosion = GameObject.Instantiate(explosionPrefab, transform.position, Quaternion.LookRotation(Vector3.up, Vector3.up));
	}

}