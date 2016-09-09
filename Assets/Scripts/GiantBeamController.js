#pragma strict
import UnityEngine.Networking;

public class GiantBeamController extends NetworkBehaviour{

	var beamCharge : ParticleSystem;
	var beamChargeSound : AudioClip;

	var beamFire : ParticleSystem;
	var beamFireSound : AudioClip;
	var beamLight : GameObject;
	var beamShakeAmount : Vector3 = Vector3(12, 9, 9);
	var beamShakeDuration : float = 2.0;

	var beam : GameObject;
	var beamEnd: Transform;
	var beamEndAir : ParticleSystem;
	var beamEndSurface : ParticleSystem;
	var beamSmoothing : float = 5.0;
	var beamDuration : float = 10.0;

	var cooldown : float = 10.0;
	var currentCooldown : float = 0.0;

	var beamStopSound : AudioClip;

	var aimTarget : Transform;

	var firing : boolean = false;

	//Component References
	var audioSource : AudioSource;
	var aimTargetController : AimTargetController;

	function Awake(){
		if(!audioSource) audioSource = GetComponent.<AudioSource>();
		if(!aimTargetController) aimTargetController = GetComponent.<AimTargetController>();
		beamEnd.parent = null;
		StopBeam();
	}

	function Update () {

		//only the local player controls input
		if(isLocalPlayer){

			if(Input.GetButtonDown("Fire1") && !firing && currentCooldown <= 0.0){
				//client side prediction
				StartCoroutine(StartBeam());
				//tell the server we're firing
				CmdStartBeam();
			}

		}

	}

	@Command
	function CmdStartBeam(){
		//don't do anything the client's cooldown isn't reset, he's cheating
		if(currentCooldown > 0.0) return;
		//tell the clients he's firing
		RpcStartBeam();
	}

	@ClientRpc
	function RpcStartBeam(){
		//local client already started function with client side prediction
		if(isLocalPlayer) return;
		StartCoroutine(StartBeam());
	}

	var onSurface = false;

	function StartBeam(){
		firing = true;
		beamCharge.Play();
		audioSource.PlayOneShot(beamChargeSound, 1.0);
		yield WaitForSeconds(1.0);

		beamCharge.Stop();
		beamFire.Play();
		CameraShakeManager.instance.Shake(beamShakeAmount, beamShakeDuration, beamFire.transform.position);
		beamLight.SetActive(true);
		audioSource.PlayOneShot(beamFireSound, 1.0);
		beamEnd.position = beamFire.transform.position;
		beam.SetActive(true);
		audioSource.Play();

		var i = 0.0;
	    var rate = 1.0/beamDuration;

	    while (i < 1.0){
			yield WaitForEndOfFrame();
			i += Time.deltaTime * rate;

			//var onSurface = false;
			var hit : RaycastHit;
			var dirToBeamEnd = (beamEnd.position - beamFire.transform.position).normalized;
			beamEnd.position = Vector3.Lerp(beamEnd.position, aimTarget.position - dirToBeamEnd, Time.deltaTime * beamSmoothing);
			beamEnd.forward = dirToBeamEnd;
			var rayDistance = Vector3.Distance(beamFire.transform.position, beamEnd.position) + 5.0;
			if(Physics.Raycast(beamFire.transform.position, dirToBeamEnd, hit, rayDistance, aimTargetController.layerMask)){
				onSurface = true;
			}
			else{
				onSurface = false;
			}

			if(onSurface){
				beamEndSurface.Play();
				beamEndAir.Stop();
			}
			else{
				beamEndSurface.Stop();
				beamEndAir.Play();
			}

		}//eof while

		audioSource.Stop();
		audioSource.PlayOneShot(beamStopSound, 1.0);
		StopBeam();
		StartCoroutine(ResetCooldown());
		firing = false;

	}

	function StopBeam(){
		beamCharge.Stop();
		beamFire.Stop();
		beamEndAir.Stop();
		beamEndSurface.Stop();
		beamLight.SetActive(false);
		beam.SetActive(false);
	}

	function ResetCooldown(){
		currentCooldown = cooldown;
		//estimate transit time on the server,
		//if the server is not this player
		if(isServer && !isLocalPlayer){
			//get the transit time of this RPC
			var netError : byte;
			var transitTimeMS : int = NetworkTransport.GetCurrentRtt(
	            connectionToClient.hostId,
	            connectionToClient.connectionId,
	            netError);
	        //convert ms to seconds, but divide by 2 first because it was a one way message
	        var transitTime : float = (transitTimeMS/2) * 0.001;
	        Debug.Log(transitTime);
	        //subtract the transit time from the cooldown
	        currentCooldown -= transitTime;
		}
		while(currentCooldown > 0.0){
			currentCooldown -= Time.deltaTime;
			yield;
		}
		currentCooldown = 0.0;
	}

	function OnGUI(){
		if(isLocalPlayer){
			GUI.Label(Rect (Screen.width - 160, 10, 150, 30), "Beam Cooldown: " + currentCooldown.ToString("F1"));
		}
	}

}