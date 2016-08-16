using UnityEngine;
using System.Collections;

public class FTME02_DeadTime : MonoBehaviour {

	public float deadtime;

	void Awake (){
		if (deadtime != 0) {
			Destroy (gameObject, deadtime);
		}
	}
	
	
	void Update () {
	
	}
}
