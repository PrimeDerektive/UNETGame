#pragma strict
import UnityEngine.Networking;

@NetworkSettings(channel=1, sendInterval=0.067)
public class SimpleInterpolatedPlayer extends NetworkBehaviour{

	var sendRate : float = 0.067;
	var lerpRate : float = 10.0;
	var aimTarget : Transform;

	@SyncVar
	public var newPos : Vector3;
	@SyncVar
	public var newAimPos : Vector3;

	//on local player start, start sending position updates to server
	function OnStartLocalPlayer(){
		InvokeRepeating("SendPosToServer", 0, sendRate);
	}

	//this function was just a way to wrap the command call and loop it with InvokeRepeating
	function SendPosToServer(){
		CmdSendPosToServer(transform.position, aimTarget.position);
	}

	//this is the command that is executed on the server that stores the client's latest state
	@Command(channel=1)
	function CmdSendPosToServer(pos : Vector3, aimPos : Vector3){
		newPos = pos;
		newAimPos = aimPos;
	}

	function Update (){
		//only remotes need to interpolate
		if(isLocalPlayer) return;

		transform.position = Vector3.Lerp(transform.position, newPos, Time.deltaTime * lerpRate);
		aimTarget.position = Vector3.Slerp(aimTarget.position, newAimPos, Time.deltaTime * lerpRate);
	}

}