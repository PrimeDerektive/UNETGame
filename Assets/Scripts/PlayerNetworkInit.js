#pragma strict
import UnityEngine.Networking;
import UnityStandardAssets.Cameras;

public class PlayerNetworkInit extends NetworkBehaviour{

	private var networkTimeManager : NetworkTimeManager;
	var isRobot : boolean = false;
	private var ping : int;

	function OnStartServer(){
		NetworkServer.SpawnObjects();
		//only the server needs a reference to the time manager
		networkTimeManager = GameObject.Find("NetworkTimeManager").GetComponent.<NetworkTimeManager>();
	}

	function OnStartLocalPlayer(){
		GetComponent.<PlayerMoveController>().enabled = true;
		Camera.main.SendMessageUpwards("SetTarget", transform, SendMessageOptions.DontRequireReceiver);
		Camera.main.SendMessageUpwards("SetupCamera", isRobot, SendMessageOptions.DontRequireReceiver);
		transform.name = "Player " + GetComponent.<NetworkIdentity>().netId;
		//newly connecting client request to have their network clocks initialized
		if(!isServer){
			CmdRequestNetworkTime();
		}
		Debug.Log(GetComponent.<NetworkIdentity>().netId.Value);
	}

	//called on client, executed on server
	@Command
	function CmdRequestNetworkTime(){
		//when a new client connects, send a fresh network time update to all clients
		//so the new client can initialize his clock
		networkTimeManager.CorrectClientTime();
	}

}