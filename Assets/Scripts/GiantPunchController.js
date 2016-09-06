#pragma strict
import RootMotion.FinalIK;
import UnityEngine.Networking;

public class GiantPunchController extends NetworkBehaviour{

	var maxRange : float = 40.0;
	var aimTarget : Transform;
	var cockedArmPosition : Transform;
	var armTrail : TrailRenderer;
	var punchLayers : LayerMask;
	var punchEffect : GameObject;

	var cockingSound : AudioClip;
	var punchSound : AudioClip;

	//component references
	var audioSource : AudioSource;
	var fbbik : FullBodyBipedIK;

	private var punching : boolean = false;

	function Awake(){
		if(!audioSource) audioSource = GetComponent.<AudioSource>();
		if(!fbbik) fbbik = GetComponent.<FullBodyBipedIK>();
		armTrail.enabled = false;
	}

	function Update () {

		//only the local player controls input
		if(isLocalPlayer){

			if(Input.GetButtonDown("Fire1") && !punching){
				StartCoroutine(Punch());
				//tell the server we're punching
				CmdPunch();
			}

		}

	}

	@Command
	function CmdPunch(){
		//tell the clients he's punching
		RpcPunch();
	}

	@ClientRpc
	function RpcPunch(){
		if(isLocalPlayer) return;
		StartCoroutine(Punch());
	}

	function Punch(){
		punching = true;

		fbbik.solver.rightHandEffector.position = cockedArmPosition.position;

		//cock the arm
		audioSource.PlayOneShot(cockingSound, 1.0);
		iTween.ValueTo(gameObject, iTween.Hash("from",0, "to", 1.0, "time", 1.0, "onupdate","TweenIKPosWeight"));
		yield WaitForSeconds(1.0);
		armTrail.enabled = true;

		var punchDir = (aimTarget.position - cockedArmPosition.position).normalized;
		var punchLength = Mathf.Min(Vector3.Distance(aimTarget.position, cockedArmPosition.position), maxRange);
		var punchTarget = cockedArmPosition.position + punchDir * punchLength;
		var punchDuration = Mathf.Min(0.25, 0.5 * punchLength/maxRange);

		//punch the arm
		audioSource.PlayOneShot(punchSound, 1.0);
		iTween.ValueTo(gameObject, iTween.Hash("from", cockedArmPosition.position, "to", punchTarget, "time", punchDuration, "onupdate", "TweenIKPosition"));
		yield WaitForSeconds(punchDuration);

		var hit : RaycastHit;
		if(Physics.Raycast(cockedArmPosition.position, punchDir, hit, punchLength + 5.0, punchLayers)){
				Instantiate(punchEffect, hit.point + hit.normal * 0.5, Quaternion.LookRotation(hit.normal));
		}

		yield WaitForSeconds(1.0 - punchDuration);
		armTrail.enabled = false;

	    //make iTween call:
		iTween.ValueTo(gameObject, iTween.Hash("from",1.0, "to", 0.0, "time", 1.0, "onupdate","TweenIKPosWeight"));
		yield WaitForSeconds(1.0);

	    punching = false;
	}

	function TweenIKPosWeight(newValue : float){
		fbbik.solver.rightHandEffector.positionWeight = newValue;
	}

	function TweenIKPosition(newValue : Vector3){
		fbbik.solver.rightHandEffector.position = newValue;
	}

}