#pragma strict

//duration over which to increase playback speed
var duration : float = 10.0;
var delay : float = 1.0;

//component references
var audioSource : AudioSource;
var particles : ParticleSystem;

function Awake () {
	audioSource = GetComponent.<AudioSource>();
	if(!particles) particles = GetComponent.<ParticleSystem>();
}

function OnEnable(){
	particles.playbackSpeed = 0.0;
	StartCoroutine(IncreasePlaybackSpeedOverTime(delay, duration));
}

function OnDisable(){
	audioSource.Stop();
}

function IncreasePlaybackSpeedOverTime(del : float, dur : float){
	yield WaitForSeconds(del);
	audioSource.Play();
	var i = 0.0;
    var rate = 1.0/(dur - del);
    while (i < 1.0){
        i += Time.deltaTime * rate;
        particles.emissionRate = Mathf.Lerp(1, 72, i);
        particles.playbackSpeed = Mathf.Lerp(0.0, 1.0, i);
        audioSource.volume = Mathf.Lerp(0.5, 1.0, i);
		audioSource.pitch = Mathf.Lerp(0.75, 1.25, i);
        yield; 
    }
}