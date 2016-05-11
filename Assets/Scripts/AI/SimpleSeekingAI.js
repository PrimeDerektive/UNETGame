#pragma strict
import UnityEngine.Networking;

public class SimpleSeekingAI extends NetworkBehaviour{

	var target : Transform;
	var targetLayer : LayerMask;

	var checkDistance : float = 10.0;
	var stopDistance : float = 2.0;

	private var agent : NavMeshAgent;

	var velocityHistory : HistoricalVelocity[] = new HistoricalVelocity[20];

	private var velocityHistoryCount : int = 0;

	class HistoricalVelocity{
		var vel : Vector3;
		var timestamp : float;
	}

	function OnStartServer(){
		InvokeRepeating("SendPosToClients", 0, 1.0);
	}

	function Start(){
		agent = GetComponent.<NavMeshAgent>();
	}

	function StoreVelocity(){
		var newHistoricalVelocity : HistoricalVelocity = new HistoricalVelocity();
		newHistoricalVelocity.vel = agent.velocity;
		newHistoricalVelocity.timestamp = Time.time;

		//If noHistoricalVelocitys are present, put in first slot.
        if( velocityHistoryCount == 0 ){
            velocityHistory[0] = newHistoricalVelocity;
        }
        else{
            //First find proper place in buffer. If no place is found, state can be dropped (newState is too old)
            for(var i = 0; i < velocityHistoryCount; i ++ ){
                //If the state in slot i is older than our new state, we found our slot.  
                if( velocityHistory[i].timestamp < newHistoricalVelocity.timestamp ){
                    // Shift the buffer sideways, to make room in slot i. possibly deleting state 20
                    for (var k = velocityHistory.Length-1; k>i; k--){
                        velocityHistory[k] = velocityHistory[k-1];
                    }
                    //insert state
                    velocityHistory[i] = newHistoricalVelocity;
                    //We are done, exit loop
                    break;
                }
            }
        }
 
        //Update TimestampCount
        velocityHistoryCount = Mathf.Min(velocityHistoryCount + 1, velocityHistory.Length);
	}

	function GetVelocityAtTime(desiredTime : float) : Vector3{
   
        if (velocityHistory[0] != null && velocityHistory[0].timestamp > desiredTime){

            for (var i = 0; i < velocityHistoryCount; i++){

                if (velocityHistory[i].timestamp <= desiredTime || i == velocityHistoryCount - 1){
                    // The state one slot newer (<100ms) than the best playback state
                    var rhs : HistoricalVelocity = velocityHistory[Mathf.Max(i-1, 0)];
                    // The best playback state (closest to 100 ms old (default time))
                    var lhs : HistoricalVelocity = velocityHistory[i];
                   
                    // Use the time between the two slots to determine if interpolation is necessary
                    var length = rhs.timestamp - lhs.timestamp;
                    var t : float = 0.0;
                   
                    if (length > 0.0001){
                        t = ((desiredTime - lhs.timestamp) / length);
                    }
                   
                    // if t=0 => lhs is used directly
                    return Vector3.Lerp(lhs.vel, rhs.vel, t);
                   
                }

            }

        }

	}


	function Update () {

		if(!target && isServer){
			var potentialTargets = Physics.OverlapSphere(transform.position, checkDistance, targetLayer);
			if(potentialTargets.length > 0){
				var netId = potentialTargets[0].GetComponent.<NetworkIdentity>().netId.Value;
				if(netId) RpcSetTarget(netId);
			}
		}
		else if(target){
			agent.SetDestination(target.position);
		}

	}

	@ClientRpc
	function RpcSetTarget(id : uint){
		var netObjects : NetworkIdentity[] = FindObjectsOfType(NetworkIdentity) as NetworkIdentity[];
		for (var netObject : NetworkIdentity in netObjects){
			if(netObject.netId.Value == id){
				target = netObject.transform;
			}
		}
	}

	//this function was just a way to wrap the RPC call and loop it with InvokeRepeating
	function SendPosToClients(){
		RpcSendPosToClients(transform.position, agent.velocity, NetworkTransport.GetNetworkTimestamp());
	}

	@ClientRpc
	function RpcSendPosToClients(pos : Vector3, vel : Vector3, timestamp : int){
		if(isServer)
			return;

		//get the first state's delay
        var error : byte;
        var serverConnection = NetworkManager.singleton.client.connection;
		var delayMS : int = NetworkTransport.GetRemoteDelayTimeMS (
            serverConnection.hostId,
            serverConnection.connectionId,
            timestamp,
            error);
		var delay : float = delayMS/1000.0;

		//var velocity  = GetVelocityAtTime(Time.time - delay);

		var extrapPos = pos + vel*delay;
		var offset : float = Vector3.Distance(extrapPos, transform.position);
		Debug.Log("offset from server pos: " + offset + " delayed: " + delay);
	}

}