#pragma strict

@NetworkSettings(channel=1)
public class AimTargetController extends NetworkBehaviour{

	var aimTarget : Transform;
	var range : float = 250.0;
	var layerMask : LayerMask;

	@SyncVar
	var newAimPos : Vector3;
	var sendRate : float = 0.1;
	var remoteAimSmoothing : float = 10.0;

	@SyncVar
	var hitboxTargetNetId : uint; //we're going to use 9999 as a null value, because we can't send nulls
	private var hitboxTargetHitboxId : byte;

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
				//check if we hit a damagable entity's hitbox
				var hitbox = hit.collider.GetComponent.<Hitbox>();
				if(hitbox){
					//get the id of the hitbox
					hitboxTargetHitboxId = hitbox.id;
					//get the network id of the root parent of the hitbox object
					hitboxTargetNetId = hit.transform.root.GetComponent.<NetworkIdentity>().netId.Value; 
				}
				else{
					//reset the hitboxTargetNetId back to "null"
					hitboxTargetNetId = 0;
				}
			}
			else{
				aimTarget.position = mainCam.position + mainCam.forward * range;
			}

		}
		else{
			//remote players set the aimTarget position to the received SyncVar
			aimTarget.position = newAimPos;
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
		if(hitboxTargetNetId != 0 && hitboxTargetHitboxId){
			//the player thinks hes aiming at an enemy, send the hitinfo
			CmdSendAimPosWithHitInfo(aimTarget.position, hitboxTargetNetId, hitboxTargetHitboxId);
		}
		else{
			//player is just aiming at empty space, just send the aimTarget position
			CmdSendAimPos(aimTarget.position);
		}
	}

	@Command(channel=1)
	function CmdSendAimPos(pos : Vector3){
		newAimPos = pos;
	}

	//called on the owner client, executed on the server
	@Command(channel=1)
	function CmdSendAimPosWithHitInfo(pos : Vector3, nId : uint, hbId : byte){

		//find the network object that the shooter claims he's aiming at
		var hitObject : NetworkIdentity = Utilities.FindNetworkObject(nId);

		//find the hitbox of the object that the shooter claims he hit
		var hitbox : Hitbox = hitObject.GetComponent.<HitboxController>().FindHitbox(hitboxId);

		var aimDir : Vector3 = (pos - barrel.position).normalized;
		var aimPos = barrel.position + (aimDir * Vector3.Distance(hitbox.transform.position, barrel.position));
		var offset = Vector3.Distance(hitbox.transform.position, aimPos);
			
			//find the network object that the shooter claims he's aiming at
			var hitObject : NetworkIdentity = Utilities.FindNetworkObject(hitboxTargetNetId);

			var relativeAimPos = Vector3();

		}
	}

}