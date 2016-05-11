#pragma strict
import UnityEngine.Networking;

@NetworkSettings(channel=2, sendInterval=0.05)
public class NetworkInterpolatedTransform extends NetworkBehaviour{

	var renderDelay : float = 0.1;
	var sendRate : float = 0.067;
	var aimTarget : Transform;
	var bufferedStates : State[] = new State[20];

	private var timestampCount : int = 0;

	//this custom struct stores the clients position data
	class State{
		var timestamp : float;
		var pos : Vector3;
		var aimPos : Vector3;
	}

	//on server start, the server must start sending the latest state to remote clients
	function OnStartServer(){
		InvokeRepeating("SendLatestStateToClients", 0, sendRate);
	}

	//on local player start, start sending position updates to server
	function OnStartLocalPlayer(){
		if(!isServer){ //the server doesn't need to send updates to himself. he knows where he is
			InvokeRepeating("SendStateToServer", 0, sendRate);
		}
	}

	//this function was just a way to wrap the RPC call and loop it with InvokeRepeating
	function SendLatestStateToClients(){
		if(isServer && hasAuthority){
			//this is the server's prefab. the server doesn't store a list of states, so just send the latest
			RpcSendLatestStateToClients(transform.position, aimTarget.position, NetworkTimeManager.networkTime);
		}
		else{
			//this is a client prefab
			//don't send anything if the server hasn't received any states yet
			if(bufferedStates[0] == null){
				return;
			}
			//send the latest state to clients
			RpcSendLatestStateToClients(bufferedStates[0].pos, bufferedStates[0].aimPos, bufferedStates[0].timestamp);
		}
	}

	//this function was just a way to wrap the command call and loop it with InvokeRepeating
	function SendStateToServer(){
		CmdSendStateToServer(transform.position, aimTarget.position, NetworkTimeManager.networkTime);
	}

	//this is the command that is executed on the server that stores the client's latest state
	@Command(channel=2)
	function CmdSendStateToServer(pos : Vector3, aimPos : Vector3, timestamp : float){
		var newState : State = new State();
		newState.pos = pos;
		newState.aimPos = aimPos;
		newState.timestamp = timestamp;
		AddNewState(newState);
	}

	//this is the RPC that the server sends to clients, updating them with the latest state of this player
	@ClientRpc(channel=2)
	function RpcSendLatestStateToClients(pos : Vector3, aimPos : Vector3, timestamp : float){
		//the local player doesn't care about his updates because he sent them in the first place
		//the server doesn't care either because he received the states from the owner client
		if(isLocalPlayer || isServer){
			return;
		}

		var newState : State = new State();
		newState.pos = pos;
		newState.aimPos = aimPos;
		newState.timestamp = timestamp;
		AddNewState(newState);
	}

	//the function used by both clients and the server to add newly received states to the buffer
	function AddNewState(newState : State){

		for (var i = bufferedStates.length - 1; i >= 1; i --){
            bufferedStates[i] = bufferedStates[i-1];
        }
       
        bufferedStates[0] = newState;
       
        timestampCount = Mathf.Min(timestampCount + 1, bufferedStates.length);
       
        for (i = 0; i < timestampCount-1; i++){
            if (bufferedStates[i].timestamp < bufferedStates[i+1].timestamp){
                Debug.Log("State inconsistent");
            }
        }

	}

	function Update (){

		//only interpolate on remote clients
		if(isLocalPlayer || timestampCount == 0 || hasAuthority){
			return;
		}

        var interpolationTime = NetworkTimeManager.networkTime - renderDelay;
   
        if (bufferedStates[0] != null && bufferedStates[0].timestamp > interpolationTime)
        {
            for (var i = 0; i < timestampCount; i++)
            {
                if (bufferedStates[i].timestamp <= interpolationTime || i == timestampCount - 1)
                {
                    // The state one slot newer (<100ms) than the best playback state
                    var rhs : State = bufferedStates[Mathf.Max(i-1, 0)];
                    // The best playback state (closest to 100 ms old (default time))
                    var lhs : State = bufferedStates[i];
                   
                    // Use the time between the two slots to determine if interpolation is necessary
                    var length = rhs.timestamp - lhs.timestamp;
                    var t : float = 0.0;
                   
                    if (length > 0.0001)
                    {
                        t = ((interpolationTime - lhs.timestamp) / length);
                    }
                   
                    // if t=0 => lhs is used directly
	                transform.position = Vector3.Lerp(lhs.pos, rhs.pos, t);
	                aimTarget.position = Vector3.Slerp(lhs.aimPos, rhs.aimPos, t);
                    return;
                   
                }
            }
        }
        else
        {
            if (bufferedStates[0] != null)
            {
                var latest = bufferedStates[0];
                transform.position = latest.pos;
                aimTarget.position = latest.aimPos;
            }
        }

	} //eof Update()

}