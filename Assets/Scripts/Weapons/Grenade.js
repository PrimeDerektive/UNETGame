#pragma strict

public class Grenade extends NetworkBehaviour{

	var lifeTime : float = 5.0;
	var explosionPrefab : GameObject;

	private var spawnTime : float = 0.0;

	function OnEnable () {
		Invoke("Explode", lifeTime);
	}


	function Explode(){
		if(isServer){
			NetworkServer.Destroy(this.gameObject);
		}
	}

	function OnNetworkDestroy(){
		var explosion = GameObject.Instantiate(explosionPrefab, transform.position, Quaternion.LookRotation(Vector3.up, Vector3.up));
	}

}