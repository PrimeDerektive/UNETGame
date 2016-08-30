using UnityEngine;
using System.Collections;

public class shooter : MonoBehaviour {

	public float range = 100f;
	public float force = 500f;
	public float damage = 50f;
	public Transform muzzle1;
	public Transform muzzle2;
	public bool canfire = false;
	public AudioSource audiosource;
	public float inaccuracy = 0.1f;
	public LayerMask mask;
	public AudioClip firesound;
	public GameObject impactnormal;
	public Transform rayposition;

	void start()
	{
		
	}
	public void fire1()
	{
		StartCoroutine(flashthemuzzle1());

		audiosource.clip = firesound;
		audiosource.pitch = 0.9f + 0.1f *Random.value;
		audiosource.Play();
		Vector3 fwrd = rayposition.transform.forward;

		Vector3 camUp = rayposition.transform.up;
		Vector3 camRight = rayposition.transform.right;

		Vector3 wantedvector = fwrd;
		wantedvector += Random.Range( -inaccuracy, inaccuracy ) * camUp + Random.Range( -inaccuracy, inaccuracy ) * camRight;
		Ray ray = new Ray (rayposition.transform.position, wantedvector);
		RaycastHit hit = new RaycastHit();

		if (Physics.Raycast(ray,out hit, range,mask))
		{   

			if(hit.rigidbody) hit.rigidbody.AddForceAtPosition (force * fwrd , hit.point);
			hit.transform.SendMessageUpwards ("Damage",damage, SendMessageOptions.DontRequireReceiver);
			GameObject decal;


				
			decal =Instantiate(impactnormal, hit.point, Quaternion.FromToRotation(Vector3.up, hit.normal)) as GameObject ;
			decal.transform.localRotation = decal.transform.localRotation * Quaternion.Euler(0,Random.Range(-90,90),0);
			decal.transform.parent = hit.transform;
		}

	}
	public void fire2()
	{
		StartCoroutine(flashthemuzzle2());

		audiosource.clip = firesound;
		audiosource.pitch = 0.9f + 0.1f *Random.value;
		audiosource.Play();
		Vector3 fwrd = rayposition.transform.forward;

		Vector3 camUp = rayposition.transform.up;
		Vector3 camRight = rayposition.transform.right;

		Vector3 wantedvector = fwrd;
		wantedvector += Random.Range( -inaccuracy, inaccuracy ) * camUp + Random.Range( -inaccuracy, inaccuracy ) * camRight;
		Ray ray = new Ray (rayposition.transform.position, wantedvector);
		RaycastHit hit = new RaycastHit();

		if (Physics.Raycast(ray,out hit, range,mask))
		{   

			if(hit.rigidbody) hit.rigidbody.AddForceAtPosition (force * fwrd , hit.point);
			hit.transform.SendMessageUpwards ("Damage",damage, SendMessageOptions.DontRequireReceiver);
			GameObject decal;



			decal =Instantiate(impactnormal, hit.point, Quaternion.FromToRotation(Vector3.up, hit.normal)) as GameObject ;
			decal.transform.localRotation = decal.transform.localRotation * Quaternion.Euler(0,Random.Range(-90,90),0);
			decal.transform.parent = hit.transform;
		}

	}
	IEnumerator flashthemuzzle1()
	{
		muzzle1.transform.localEulerAngles = new Vector3(0f,0f,Random.Range(0f,360f));
		muzzle1.gameObject.SetActive(true);
		yield return new WaitForSeconds(0.05f);
		muzzle1.gameObject.SetActive(false);
	}
	IEnumerator flashthemuzzle2()
	{
		muzzle2.transform.localEulerAngles = new Vector3(0f,0f,Random.Range(0f,360f));
		muzzle2.gameObject.SetActive(true);
		yield return new WaitForSeconds(0.05f);
		muzzle2.gameObject.SetActive(false);

	}



}
