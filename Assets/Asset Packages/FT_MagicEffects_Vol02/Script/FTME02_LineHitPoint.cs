﻿using UnityEngine;
using System.Collections;

public class FTME02_LineHitPoint : MonoBehaviour {

	void Update () {
		Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		RaycastHit hit;
		if (Physics.Raycast (ray, out hit, 500f)) {
			transform.position = new Vector3(hit.point.x, hit.point.y,hit.point.z);
		}	
	}
}
