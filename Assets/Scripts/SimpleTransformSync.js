#pragma strict
import UnityEngine.Networking;

	public class SimpleTransformSync extends NetworkBehaviour{

	private var newPos : Vector3;

	function OnStartServer(){
		InvokeRepeating("SendToClients", 0, 0.067);
	}

	function OnStartLocalPlayer(){
		InvokeRepeating("SendToServer", 0, 0.067);
	}

	function SendToClients(){
		RpcMove(newPos);
	}

	function SendToServer(){
		CmdMove(transform.position);
	}

	private var firstMove : boolean = true;
	private var lastTimestamp : float = 0.0;
	private var newTimestamp : float = 0.0;

	@ClientRpc
	function RpcMove(pos : Vector3){
		Move(pos);
	}

	@Command
	function CmdMove(pos : Vector3){
		Move(pos);
	}

	function Move(pos : Vector3){
		lastTimestamp = newTimestamp;
		newTimestamp = Time.time;
		newPos = pos;
		firstMove = false;
	}

	function Update(){
		if(isLocalPlayer)
			return;
		if(!firstMove && newTimestamp != 0.0)
			transform.position = Vector3.Lerp(transform.position, newPos, Time.deltaTime*(1.0/(newTimestamp - lastTimestamp)));
	}

}
