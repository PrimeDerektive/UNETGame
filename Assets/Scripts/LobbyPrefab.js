#pragma strict
import UnityEngine.Networking;


public class LobbyPrefab extends NetworkBehaviour{

	var soldierPrefab : GameObject;
	var droidPrefab : GameObject;

	@Command
	function CmdSpawnPlayerPrefab(sendingPlayerId : NetworkInstanceId, isSpawningDroid : boolean){

		//get the sending player's existing lobby prefab
		var oldPlayerPrefab = NetworkServer.FindLocalObject(sendingPlayerId);

		//get the player's connection
		var connection = oldPlayerPrefab.GetComponent.<NetworkIdentity>().connectionToClient;

		//spawn him a new prefab
		var newPlayerPrefab = Instantiate(soldierPrefab, oldPlayerPrefab.transform.position, oldPlayerPrefab.transform.rotation);
        
		//replace his lobby prefab with the new prefab as his owned network object
        NetworkServer.ReplacePlayerForConnection(connection, newPlayerPrefab, 0);

        //destroy the lobby prefab
        NetworkServer.Destroy(oldPlayerPrefab);

	}

	function OnGUI(){
		if(isLocalPlayer){
			if (GUI.Button (Rect ((Screen.width*0.5) - 160, (Screen.height*0.5) - 15, 150, 30), "Spawn as Soldier")){
				CmdSpawnPlayerPrefab(GetComponent.<NetworkIdentity>().netId, false);
			}
			if (GUI.Button (Rect ((Screen.width*0.5) + 10, (Screen.height*0.5) - 15, 150, 30), "Spawn as Droid")){
			
			}
		}
	}

}