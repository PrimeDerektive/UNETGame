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

			if(Input.GetButtonDown("Fire1") && !firing){
				StartCoroutine(StartBeam());
				//tell the server we're firing
				CmdStartBeam();
			}

		}

	}

	@Command
	function CmdStartBeam(){
		//tell the clients he's firing
		RpcStartBeam();
	}

	@ClientRpc
	function RpcStartBeam(){
		if(isLocalPlayer) return;
		StartCoroutine(StartBeam());
	}


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

			var onSurface = false;
			var hit : RaycastHit;
			var dirToBeamEnd = (beamEnd.position - beamFire.transform.position).normalized;
			beamEnd.position = Vector3.Lerp(beamEnd.position, aimTarget.position - dirToBeamEnd, Time.deltaTime * beamSmoothing);
			beamEnd.forward = dirToBeamEnd;
			var rayDistance = Vector3.Distance(beamFire.transform.position, beamEnd.position) + 10.0;
			if(Physics.Raycast(beamFire.transform.position, dirToBeamEnd, hit, rayDistance, aimTargetController.layerMask)){
				onSurface = true;
			}

			if(onSurface){
				if(!beamEndSurface.isPlaying){
					beamEndSurface.Play();
				}
				if(beamEndAir.isPlaying){
					beamEndAir.Stop();
				}

			}
			else{
				if(beamEndSurface.isPlaying){
					beamEndSurface.Stop();
				}
				if(!beamEndAir.isPlaying){
					beamEndAir.Play();
				}
			}

		}//eof while

		audioSource.Stop();
		audioSource.PlayOneShot(beamStopSound, 1.0);
		StopBeam();
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

}