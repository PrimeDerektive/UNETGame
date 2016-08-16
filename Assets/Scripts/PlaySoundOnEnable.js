#pragma strict

var sounds : AudioClip[];
var audioSource : AudioSource;

function Awake(){
	if(!audioSource) audioSource = GetComponent.<AudioSource>();
}

function OnEnable(){
	audioSource.PlayOneShot(sounds[Random.Range(0, sounds.length)], 1.0);
}