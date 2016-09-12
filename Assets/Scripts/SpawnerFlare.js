#pragma strict
import UnityEngine.Networking;

public class SpawnerFlare extends NetworkBehaviour{

	//these variables are only used by the server, set at instantiation so the server can
	//send the RPC to move the spawner into place
	@HideInInspector
	var origin : Vector3;
	@HideInInspector
	var destination : Vector3;

	var robotPrefab : GameObject;
	var spawnRadius : float = 10.0;
	var spawnerLayer : LayerMask;
	var robotsToSpawn : int = 5;
	var delayBeforeSpawns : float = 5.0;
	var timeBetweenSpawns : float = 0.5;
	private var spawnPoints = new List.<Vector3>();

	var explosionPrefab : GameObject;

	//beam shooting in the sky, needs to be enabled after spawner is in position
	var beacon : GameObject;

	//Component references
	var audioSource : AudioSource;

	function Awake(){
		if(!audioSource) audioSource = GetComponent.<AudioSource>();
		//disable beacon beam
		beacon.SetActive(false);
	}

	function Start(){
		//send rpc to clients when the server is ready
		//this should be in OnStartServer() but doesn't work for some reason
		if(isServer){
			var travelTime : float = Vector3.Distance(origin, destination)/250.0 * 2.0;
			RpcMoveIntoPosition(destination, travelTime);
			StartCoroutine(FindSpawnPoints(travelTime));
		}
	}

	@ClientRpc
	function RpcMoveIntoPosition(endPos : Vector3, moveTime : float){
		//rotate upward
		transform.up = Vector3.up;
		//compensate for transit time on clients
		if(!isServer){
			//get the transit time of this RPC
			var transitTime = Utilities.GetTransitTime(NetworkManager.singleton.client.connection);
	        //subtract the transit time from the cooldown
	        moveTime -= transitTime;
		}
		iTween.MoveTo(gameObject, endPos, moveTime);
		Invoke("InPosition", moveTime);
	}

	function InPosition(){
		audioSource.Play();
		beacon.SetActive(true);
		//destroy self after all spawns are complete, plus a second for good measure
		Invoke("DestroySelf", delayBeforeSpawns + (timeBetweenSpawns*robotsToSpawn) + 1.0);
	}

	function DestroySelf(){
		Instantiate(
			explosionPrefab,
			transform.position,
			transform.rotation);
		Destroy(gameObject);
	}

	function FindSpawnPoints(delay : float){
		yield WaitForSeconds(delay);
		//server needs to find valid spawn points
		var spawnPointsToFind : int = robotsToSpawn;
		while(spawnPointsToFind > 0){
			//get a random position within spawn radius
			var potentialSpawnPoint = transform.position + Random.insideUnitSphere * spawnRadius;
			//kill y
			potentialSpawnPoint.y = transform.position.y;

			//first, make sure its not overlapping any existing spawnpoints
			var safeToSpawn : boolean = true;
			for(var spawnPoint : Vector3 in spawnPoints){
				if(Vector3.Distance(spawnPoint, potentialSpawnPoint) <= 2.0){
					safeToSpawn = false;
				}
			}

			//then, make sure its on the ground
			if(safeToSpawn && Physics.Raycast(potentialSpawnPoint + Vector3.up, -Vector3.up, 2.0, spawnerLayer)){
				//then we make sure nothing is in the way
				if(!Physics.CheckCapsule((potentialSpawnPoint + Vector3.up), potentialSpawnPoint + Vector3.up * 2.0, 0.75)){
					
					//we can safely spawn here
					spawnPoints.Add(potentialSpawnPoint);
					spawnPointsToFind--;
				}
			}
			yield;
		}
		//if we got here, we found all the spawns
		yield WaitForSeconds(delayBeforeSpawns);
		for(spawnPoint in spawnPoints){
			var newRobot = Instantiate(robotPrefab, spawnPoint, Quaternion.Euler(0, Random.Range(0, 180), 0));
			NetworkServer.Spawn(newRobot);
			yield WaitForSeconds(timeBetweenSpawns);
		}

	}

}
