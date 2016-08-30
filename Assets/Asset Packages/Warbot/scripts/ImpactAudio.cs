using UnityEngine;
using System.Collections;

public class ImpactAudio : MonoBehaviour {

	

	private AudioSource myaudio;
	public AudioClip[] impactSounds;    	
	void Start() {
		myaudio = GetComponent<AudioSource>();
	}
		
		
	void OnCollisionEnter(Collision collision) {

		// Play a sound if the colliding objects had a big impact.		

		int n = Random.Range(1,impactSounds.Length);
		myaudio.clip = impactSounds[n];
		myaudio.pitch = 0.9f + 0.1f *Random.value;
		myaudio.PlayOneShot(myaudio.clip);
			
		impactSounds[n] = impactSounds[0];
		impactSounds[0] = myaudio.clip;

			
	}
}
