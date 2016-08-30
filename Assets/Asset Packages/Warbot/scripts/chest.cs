using UnityEngine;
using System.Collections;

public class chest : MonoBehaviour {

	public Transform player;
	public Transform target;

	public float maxSway = 10f;
	public Vector3 addVector;
	private float currentrotation;

	public float jumplandMove = 3f;
	public float jumplandRotation = 20f;
	Vector3 parentLastPosition;
	Vector3 startPosition;

	Vector3 wantedposition;
	bool prevGrounded;
	   
	public AudioClip JumpSound;           
	public AudioClip LandSound;

	public AudioSource myAudioSource;
	public Transform leftarm;
	public Transform rightarm;

	private float	springPos  = 0f;
	private float	springVelocity  = 0f;
	private float	springElastic = 1.1f;		
	private float	springDampen = 0.8f;
	private float	springVelocityThreshold = 0.05f;
	private float springPositionThreshold= 0.05f;

	private float yPos; 
	private float tilt;

	robotcontroller robotcontrol ;
	void Start () 
	{
		
		parentLastPosition = transform.parent.position;
		startPosition = transform.localPosition;

		robotcontrol = player.GetComponent<robotcontroller>();
	}
	
	// Update is called once per frame
	void LateUpdate () 
	{

		 
		float velocityChange = (parentLastPosition.y - transform.parent.position.y) * 10f;
		springVelocity -= velocityChange;		
			
		Vector3 playervelocity = robotcontrol.localvelocity;
	
								
		springVelocity -= springPos*springElastic;					
		springVelocity *= springDampen;								
		springPos += springVelocity * Time.deltaTime;	
		springPos = Mathf.Clamp( springPos, -.3f, .3f );			

		if (Mathf.Abs(springVelocity) < springVelocityThreshold && Mathf.Abs (springPos) < springPositionThreshold)
		{
			springVelocity = 0;
			springPos = 0;
		}

		yPos = springPos * jumplandMove;
		tilt = springPos * jumplandRotation;

		if (!prevGrounded && player.GetComponent<CharacterController>().isGrounded )
		{
			
			//doland
			
			myAudioSource.clip = LandSound;
			myAudioSource.Play();
			
			
		}
		else if (prevGrounded && !player.GetComponent<CharacterController>().isGrounded)
		{
			//dojump
			
			
			myAudioSource.clip = JumpSound;
			myAudioSource.Play();
			
		}
	

		if (playervelocity.x > 0.2f)
		{
			//Sway right
			currentrotation = maxSway *  playervelocity.x;
		}

		else if (playervelocity.x < -0.2f)
		{
			//Sway left
			currentrotation = -maxSway * -playervelocity.x;
		}
		else
		{
			currentrotation = 0f;
		}


		Vector3 Wantedrotation = new Vector3(tilt ,0f, currentrotation);
		Quaternion lookrotation = Quaternion.LookRotation(target.transform.position - transform.position,Vector3.up);



		if (robotcontrol.isaiming)
		{
			transform.localEulerAngles = Wantedrotation + addVector + new Vector3(-lookrotation.eulerAngles.x,0f,0f);
			Quaternion leftrotation = Quaternion.LookRotation(leftarm.transform.position - target.position, Vector3.up);
			Vector3 leftwanted = new Vector3 (leftarm.transform.eulerAngles.x,leftrotation.eulerAngles.y,rightarm.transform.eulerAngles.z);

			leftarm.transform.eulerAngles = leftwanted;

			Quaternion rightrotation = Quaternion.LookRotation(rightarm.transform.position - target.position, Vector3.up);
			Vector3 rightwanted = new Vector3 (rightarm.transform.eulerAngles.x,rightrotation.eulerAngles.y,rightarm.transform.eulerAngles.z);
			rightarm.transform.eulerAngles = rightwanted;
		}
		else
		{
			transform.localEulerAngles = Wantedrotation + addVector;
		}


		wantedposition = new Vector3(0f,0f,yPos);

		transform.localPosition = startPosition + wantedposition;


		prevGrounded = player.GetComponent<CharacterController>().isGrounded;
		parentLastPosition = transform.parent.position;

	}
}
