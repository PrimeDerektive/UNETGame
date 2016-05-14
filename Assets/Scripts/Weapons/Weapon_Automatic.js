#pragma strict
import UnityEngine.Networking;

@NetworkSettings(channel=1, sendInterval=0.1)
public class Weapon_Automatic extends NetworkBehaviour{


	public var fireRate : float = 0.1;
	public var aimTarget : Transform;
	public var barrel : Transform;
	public var muzzleFlash : GameObject;
	public var shotSound : AudioClip;
	public var falloffSound : AudioClip;
	public var tracerPrefab : Transform;
	public var hitEffect : GameObject;
	var range : float = 250.0;
	public var layerMask : LayerMask;

	@SyncVar(hook="OnFiringUpdate")
	public var firing : boolean = false;

	private var nextFireAllowed : float = 0.0;

	function Update(){

		if(isLocalPlayer){
			if(Input.GetButtonDown("Fire1") && !firing){
				firing = true;
				CmdUpdateFiring(firing);
			}

			if(Input.GetButtonUp("Fire1") && firing){
				firing = false;
				GetComponent.<AudioSource>().PlayOneShot(falloffSound, 1.0);
				CmdUpdateFiring(firing);
			}
		}

		if(firing && Time.time > nextFireAllowed){
			Fire();
			nextFireAllowed = Time.time + fireRate;
		}

	}

	//owner tells server when his firing var changes
	@Command(channel=1)
	function CmdUpdateFiring(newFiringValue : boolean){
		firing = newFiringValue;
	}

	function Fire(){

		barrel.LookAt(aimTarget);
		StartCoroutine(EnableMuzzleFlash());
		GetComponent.<AudioSource>().PlayOneShot(shotSound, 1.0);
		//var spreadModifier = Vector3(Random.Range(-bulletSpread, bulletSpread), Random.Range(-bulletSpread, bulletSpread), 0);
		//barrel.forward += spreadModifier;
		var tracer = GameObject.Instantiate(tracerPrefab, barrel.position, barrel.rotation);
		var tracerScript = tracer.GetComponent.<SimpleBullet>();
		
		var hit : RaycastHit;
		if(Physics.Raycast(barrel.position, barrel.forward, hit, range, layerMask)){
			//var newHitEffect : Transform = Transform.Instantiate(hitEffect, hit.point, Quaternion.LookRotation(hit.normal));
			
			//check if we hit a damagable entity's hitbox
			var hitbox = hit.collider.GetComponent.<Hitbox>();
			if(hitbox && isLocalPlayer){ //the local player must claim hits if he thinks he hit stuff
				//get the network ID of the root parent of the hitbox object
				var netId = hitbox.transform.root.GetComponent.<NetworkIdentity>().netId.Value; 
				CmdHitClaim(netId, hitbox.id);
			}
			Instantiate(hitEffect, hit.point, Quaternion.LookRotation(hit.normal));
			tracerScript.dist = hit.distance;
		}
		else{
			tracerScript.dist = range;
		}
		
		
		//CameraShakeManager.instance.Shake(Vector3(1.25, 0.5, 0.5), 0.6);
	}

	function EnableMuzzleFlash(){
		muzzleFlash.SetActive(true);
		yield WaitForSeconds(0.05);
		muzzleFlash.SetActive(false);
	}

	//client side SyncVar callback
	function OnFiringUpdate(newFiringValue : boolean){
		if(isLocalPlayer){
			return;
		}
		firing = newFiringValue;
	}

	@Command(channel=1)
	function CmdHitClaim(nId : uint, hitboxId : byte){

		//find the network object that the shooter claims he shot
		var hitObject : NetworkIdentity = Utilities.FindNetworkObject(nId);

		//find the hitbox of the object that the shooter claims he hit
		var hitbox : Hitbox = hitObject.GetComponent.<HitboxController>().FindHitbox(hitboxId);

		var aimDir : Vector3 = (GetComponent.<NetworkInterpolatedTransform>().bufferedStates[0].aimPos - barrel.position).normalized;
		var aimPos = barrel.position + (aimDir * Vector3.Distance(hitbox.transform.position, barrel.position));
		var offset = Vector3.Distance(hitbox.transform.position, aimPos);

		Debug.Log("Client claims he hit: " + hitbox.transform.name + ", with offset: " + offset + ", bounds: " + hitbox.col.bounds.size.magnitude);
		
	}

}