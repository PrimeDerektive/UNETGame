#pragma strict
import UnityEngine.Networking;


public class RobotSpawner extends NetworkBehaviour{

	var robotTankerPrefab : GameObject;

	function SpawnRobotTanker(){
		var newRobotTanker = Instantiate(robotTankerPrefab, transform.position, transform.rotation);
		NetworkServer.Spawn(newRobotTanker);
	}

	function OnGUI(){
		if(isServer){
			if (GUI.Button (Rect (Screen.width - 160,10,150,30), "Spawn Robot Tanker")){
				SpawnRobotTanker();
			}
		}
	}

}