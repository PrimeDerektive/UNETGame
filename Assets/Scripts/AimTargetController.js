#pragma strict

@NetworkSettings(channel=1)
public class AimTargetController extends NetworkBehaviour{

	var sendRate : float = 0.1;
	var aimTarget : Transform;
	var range : float = 250.0;
	var layerMask : LayerMask;
	var remoteAimSmoothing : float = 10.0;

	private var mainCam : Transform;

	function Start(){
		mainCam = Camera.main.transform;
		aimTarget.parent = null;
	}

	function OnStartLocalPlayer(){
		InvokeRepeating("SendAimPosToServer", 0, sendRate);
	}

	function Update () {

		if(isLocalPlayer){
			//local player positions aimTarget with raycasting
			var hit : RaycastHit;
			if(Physics.Raycast(mainCam.position, mainCam.forward, hit, range, layerMask)){
				aimTarget.position = hit.point;
			}
			else{
				aimTarget.position = mainCam.position + mainCam.forward * range;
			}

		}

	}

	//rotate towards the aimTarget in LateUpdate()
	function LateUpdate () {

		//get the direction to the aimTarget
		var dirToAimTarget = aimTarget.position - transform.position;
		dirToAimTarget.y = transform.forward.y; //kill Y so we only rotate on Y axis
		
		if(isLocalPlayer){
			//local player can snap to direction immediately because he's updating it every frame
			transform.forward = dirToAimTarget;
		}
		else{
			//remote players must smoothly look at the aimTarget as they're only updating 10x/sec
			transform.forward = Vector3.Slerp(transform.forward, dirToAimTarget, Time.deltaTime * remoteAimSmoothing);
		}

	}

	//just wrapped this way so we could InvokeRepeat sending on the owner
	function SendAimPosToServer(){

		//do the raycast again to see if we're currently aiming at a damagable network entity
		var hit : RaycastHit;
		if(Physics.Raycast(mainCam.position, mainCam.forward, hit, range, layerMask)){
			//check if we hit a damagable entity's hitbox and store a reference
			var hitbox = hit.collider.GetComponent.<Hitbox>();
		}

		//if we're aiming at a damagable network entity
		if(hitbox){
			//the player thinks hes aiming at an enemy, send the hitinfo with the aim update command
			var hitObjectNetId = hit.transform.root.GetComponent.<NetworkIdentity>().netId.Value;
			CmdSendAimPosWithHitInfo(aimTarget.position, hitObjectNetId, hitbox.id);
		}
		else{
			//player is just aiming at empty space, just send the aimTarget position
			CmdSendAimPos(aimTarget.position);
		}

	}

	@Command(channel=1)
	function CmdSendAimPos(pos : Vector3){
		aimTarget.position = pos;
		//broadcast the new aimTarget position to clients
		RpcSendAimPosToClients(pos);
	}

	@ClientRpc(channel=1)
	function RpcSendAimPosToClients(pos : Vector3){
		if(isLocalPlayer || isServer){
			//the server and the local player don't care about this update because they already know the position
			return;
		}
		aimTarget.position = pos;
	}

	//called on the owner client, executed on the server
	//this function is sent from the owner client to the server when the owner
	//thinks he was aiming at a network entity. He sends the netId of the object
	//he thinks he's aiming at, and the hitbox id of said object, and the server
	//validates or rejects the claim with a raycast distance check and broadcasts
	//the appropriate RPC to other clients
	@Command(channel=1)
	function CmdSendAimPosWithHitInfo(pos : Vector3, nId : uint, hbId : byte){

		//find the network object that the shooter claims he's aiming at
		var hitObject : NetworkIdentity = Utilities.FindNetworkObject(nId);

		//find the hitbox of the object that the shooter claims he's aiming at
		var hitbox : Hitbox = hitObject.GetComponent.<HitboxController>().FindHitbox(hbId);

		//create a ray from the sent aim pos to the hitbox the shooter claims he's aiming at
		var ray : Ray = new Ray(pos, (hitbox.col.bounds.center - pos).normalized);

		var hit : RaycastHit;
		//check whether or not its a valid claim by raycasting against the hitbox collider with a ray length
		//equal to the collider bounds. this gives the client a little bit of leeway because its quite large
		if(hitbox.col.Raycast(ray, hit, hitbox.col.bounds.size.magnitude)){
			//if we are in here, it was a valid aim claim. Set the aimTarget to a new position relative to the hitbox collider x z
			aimTarget.position = Vector3(hitbox.col.bounds.center.x, pos.y, hitbox.col.bounds.center.z);
			//send hit correction aim RPC since the shooter is validly claiming he's aiming at a network entity
			RpcSendAimPosWithHitInfo(pos, nId, hbId);
		}
		else{
			//claim failed. update the aimTarget position to what was sent
			aimTarget.position = pos;
			//send the regular aim pos RPC since it doesn't need to be reposition
			RpcSendAimPosToClients(pos);
		}
	}

	//this function is sent from the server to remote clients
	//when it verifies a client's claim that he was aiming at a network entity
	//it repositions the aimTarget to align with the hitbox of the entity the aimer claimed
	@ClientRpc(channel=1)
	function RpcSendAimPosWithHitInfo(pos : Vector3, nId : uint, hbId : byte){

		if(isLocalPlayer || isServer){
			//the server and the local player don't care about this update because they already know the position
			return;
		}

		//find the network object that the shooter claims he's aiming at
		var hitObject : NetworkIdentity = Utilities.FindNetworkObject(nId);

		//find the hitbox of the object that the shooter claims he's aiming at
		var hitbox : Hitbox = hitObject.GetComponent.<HitboxController>().FindHitbox(hbId);

		//position the aimTarget's x and z to align with the hitbox
		aimTarget.position = Vector3(hitbox.col.bounds.center.x, pos.y, hitbox.col.bounds.center.z);

	}

}