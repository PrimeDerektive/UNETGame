using UnityEngine;
using System.Collections;

public class thirdpersonCamera : MonoBehaviour {

	public Transform target;
	public Vector3 targetOffset = Vector3.zero;
	public float distance = 4.0f;


	public float sensitivity = 0.01f;
	public LayerMask lineOfSightMask = 0;
	public float closerRadius= 0.2f;
	public float closerSnapLag = 0.2f;

	public float xSpeed = 200.0f;
	public float ySpeed = 80.0f;

	public float yMinLimit = -20f;
	public float yMaxLimit = 80f;

	private float currentDistance = 10.0f;
	private float x = 0.0f;
	private float y = 0.0f;
	private float distanceVelocity = 0.0f;

	void Start () 
	{
		Vector3 angles = transform.eulerAngles;
		x = angles.y;
		y = angles.x;
		currentDistance = distance;
	
	}
	

	void LateUpdate () 
	{
		if (target) {
			x += Input.GetAxis("Mouse X") * xSpeed * sensitivity;
			y -= Input.GetAxis("Mouse Y") * ySpeed * sensitivity;

			y = ClampAngle(y, yMinLimit, yMaxLimit);

			Quaternion rotation = Quaternion.Euler(y, x, 0f);
			Vector3 targetPos = target.position + targetOffset;
			Vector3 direction = rotation * -Vector3.forward;

			float targetDistance = AdjustLineOfSight(targetPos, direction);
			currentDistance = Mathf.SmoothDamp(currentDistance, targetDistance, ref distanceVelocity, closerSnapLag * .3f);

			transform.rotation = rotation;
			transform.position = targetPos + direction * currentDistance;
		}
	}

	float AdjustLineOfSight (Vector3 target, Vector3 direction)
	{
		RaycastHit hit;
		if (Physics.Raycast (target, direction, out hit, distance, lineOfSightMask.value))
			return hit.distance - closerRadius;
		else
			return distance;
	}
	static float ClampAngle ( float angle,  float min,  float max) {
		if (angle < -360)
			angle += 360;
		if (angle > 360)
			angle -= 360;
		return Mathf.Clamp (angle, min, max);
	}
}

