using UnityEngine;
using System.Collections;

public class Camera1 : MonoBehaviour {


	public Transform normalposition;
	public Transform aimposition;	
	public float aimFOV = 45f;
	public float normalFOV = 65f;
	public float speed = 5f;

	float nextField;

	private float refer = 0.0f;
	public Transform crosshair;
	public Transform target;	
	public float range = 100f;

	public LayerMask  mask;


	void Update () 
	{
		float step = speed * Time.deltaTime;
		Cursor.lockState = CursorLockMode.Locked;
		float newField = Mathf.SmoothDamp(GetComponent<Camera>().fieldOfView, nextField, ref refer, .3f);
		GetComponent<Camera>().fieldOfView = newField;

		if (Input.GetButton("Fire3"))
		{

			transform.position = Vector3.MoveTowards(transform.position, aimposition.position, step);
			nextField = aimFOV;

			Vector3 fwrd = Camera.main.transform.forward;	
			Ray ray = new Ray (Camera.main.transform.position, fwrd);
			RaycastHit hit = new RaycastHit();

			if (Physics.Raycast(ray,out hit, range,mask))
			{   
				crosshair.position =  hit.point;
				crosshair.rotation = Quaternion.FromToRotation(Vector3.up, hit.normal);
				crosshair.gameObject.SetActive(true);

			}
			else
			{

				crosshair.gameObject.SetActive(false);
				crosshair.transform.position =  target.position;
				crosshair.transform.rotation = target.transform.rotation;
			}
		}
		else
		{

			crosshair.gameObject.SetActive(false);
			transform.position = Vector3.MoveTowards(transform.position, normalposition.position, step);
			nextField = normalFOV;
		}
	
	}
}
