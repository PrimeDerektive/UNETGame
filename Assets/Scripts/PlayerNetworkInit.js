#pragma strict
import UnityEngine.Networking;

public class PlayerNetworkInit extends NetworkBehaviour{

	private var networkTimeManager : NetworkTimeManager;
	private var ping : int;

	function OnStartServer(){
		NetworkServer.SpawnObjects();
		//only the server needs a reference to the time manager
		networkTimeManager = GameObject.Find("NetworkTimeManager").GetComponent.<NetworkTimeManager>();
	}
	

	function OnStartLocalPlayer(){
		GetComponent.<PlayerMoveController>().enabled = true;
		GetComponent.<MatchCameraEulerY>().enabled = true;
		GetComponent.<AimTargetController>().enabled = true;
		Camera.main.SendMessageUpwards("SetTarget", transform, SendMessageOptions.DontRequireReceiver);
		transform.name = "Player " + GetComponent.<NetworkIdentity>().netId;
		//newly connecting client request to have their network clocks initialized
		if(!isServer){
			CmdRequestNetworkTime();
		}
	}

	//called on client, executed on server
	@Command
	function CmdRequestNetworkTime(){
		//when a new client connects, send a fresh network time update to all clients
		//so the new client can initialize his clock
		networkTimeManager.CorrectClientTime();
	}

}