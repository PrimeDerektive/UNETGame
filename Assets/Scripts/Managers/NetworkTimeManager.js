#pragma strict

import UnityEngine.Networking;

public class NetworkTimeManager extends NetworkBehaviour{

	static var networkTime : float = 0.0; //the network time
	var ping : float = 0.0; //the local client's ping
	var correctionRate : float = 5.0; //the rate at which the server sends corrections to clients
	var maxCorrections: int = 5; //the maximum amount of corrections before a client is considered sufficiently synchornized
	var correctionCount : int = 0; //amount of corrections the client has executed. can be reset to 0 to re-synchronize
	var maxError : float = 0.05; //maximum threshhold for drift before a client needs to re-synchronize (default 50ms)

	private var netClient : NetworkClient; //the local NetworkClient Object

	function OnStartServer(){
		//server starts sending corrections to all clients in startup
		InvokeRepeating("CorrectClientTime", 0, correctionRate);
	}

	function Start () {
		//cache reference to local NetworkClient
		netClient = NetworkManager.singleton.client;
	}

	//this function is just used to wrap the RPC call for InvokeRepeating
	function CorrectClientTime(){
		//send the clients the latest correct time and timestamp
		RpcCorrectClientTime(networkTime, NetworkTransport.GetNetworkTimestamp());
	}

	@ClientRpc(channel=1)
	function RpcCorrectClientTime(correctTime : float, timestamp : float){

		//server doesn't need to correct his own time as he has authority over the simulation
		if(isServer){
			return;
		}

		//get the transit time of this RPC
		var netError : byte;
		var transitTimeMS : int = NetworkTransport.GetRemoteDelayTimeMS (
            netClient.connection.hostId,
            netClient.connection.connectionId,
            timestamp,
            netError);
        var transitTime : float = transitTimeMS * 0.001;

		//account for the transit time of the RPC
		correctTime += transitTime;

		//get drift error
		var error : float = Mathf.Abs(correctTime - networkTime);
		Debug.Log(error);
		//if error is greater than limit, and we're no longer correcting,
		//start correcting again by resetting count
		if(error >= maxError && correctionCount >= maxCorrections){
			Debug.Log("Network time is out of sync! Re-syncing.");
			correctionCount = 0;
		}

		//if our error is within limits and we've been sufficiently synchronized, do not correct
		if(correctionCount >= maxCorrections){
			return;
		}

		//apply the correction and increment the correction counter
		networkTime = correctTime;
		correctionCount++;
	}

	function Update () {
		//get our ping and increment our local network time
		ping = netClient.GetRTT()/2;
		networkTime += Time.deltaTime;
	}

	function OnGUI(){
		GUI.Label(new Rect(Screen.width - 170, Screen.height - 60, 150, 20), "Time: " + networkTime);
		GUI.Label(new Rect(Screen.width - 170, Screen.height - 40, 150, 20), "Ping: " + ping);
	}

}