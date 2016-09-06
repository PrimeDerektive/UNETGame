#pragma strict
import UnityEngine.Networking;


public class SpawnerFlare extends NetworkBehaviour{

	var robotPrefab : GameObject;
	var spawnRadius : float = 10.0;
	var spawnerLayer : LayerMask;
	var robotsToSpawn : int = 5;
	private var spawnPoints = new List.<Vector3>();

	function OnStartServer(){
		StartCoroutine(FindSpawnPoints());
	}

	function FindSpawnPoints(){
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
		yield WaitForSeconds(5.0);
		for(spawnPoint in spawnPoints){
			var newRobot = Instantiate(robotPrefab, spawnPoint, Quaternion.Euler(0, Random.Range(0, 180), 0));
			NetworkServer.Spawn(newRobot);
			yield WaitForSeconds(0.5);
		}

	}

}
