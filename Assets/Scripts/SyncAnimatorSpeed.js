#pragma strict
import UnityEngine.Networking;

public class SyncAnimatorSpeed extends NetworkBehaviour{

	var smoothing : float = 10.0;
	var dampTime : float = 0.2;

	@SyncVar
	var smoothSpeedX : float;
	@SyncVar
	var smoothSpeedY : float;

	//component references
	var anim : Animator;

	function Start () {
		if(!anim) anim = GetComponent.<Animator>();
	}

	function OnStartClient(){
		GetComponent.<AnimatorController>().calcVelocity = false;
	}

	function OnStartLocalPlayer(){
		GetComponent.<AnimatorController>().calcVelocity = true;
		InvokeRepeating("SendSpeedToServer", 0, 0.1);
	}

	function SendSpeedToServer(){
		smoothSpeedX = anim.GetFloat("speedX");
		smoothSpeedY = anim.GetFloat("speedY");
		CmdSendSpeedToServer(smoothSpeedX, smoothSpeedY);
	}

	@Command
	function CmdSendSpeedToServer(x : float, y : float){
		smoothSpeedX = x;
		smoothSpeedY = y;
	}

	function Update () {

		if(!isLocalPlayer){
			var speedX = Mathf.Lerp(anim.GetFloat("speedX"), smoothSpeedX, Time.deltaTime * smoothing);
			var speedY = Mathf.Lerp(anim.GetFloat("speedY"), smoothSpeedY, Time.deltaTime * smoothing);
			//send the values to the animator
			anim.SetFloat("speedX", speedX, dampTime, Time.deltaTime);
			anim.SetFloat("speedY", speedY, dampTime, Time.deltaTime);
		}

	}

}