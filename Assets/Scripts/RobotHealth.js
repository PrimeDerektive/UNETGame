#pragma strict
import UnityEngine.Networking;
import BehaviourMachine;

var maxHealth : int = 100;
var currentHealth : int;

var deathSound : AudioClip;
var deathEffects : ParticleSystem[];
var deathExplosion : GameObject;
var isDead : boolean = false;

//component references
var stateMachine : StateMachine;
var agent : NavMeshAgent;
var audioSource : AudioSource;
var ragdoll : RagdollManager;
var smr : SkinnedMeshRenderer;



function Start () {
	if(!stateMachine) stateMachine = GetComponent.<StateMachine>();
	if(!agent) agent = GetComponent.<NavMeshAgent>();
	if(!audioSource) audioSource = GetComponent.<AudioSource>();
	if(!ragdoll) ragdoll = GetComponent.<RagdollManager>();
	if(!smr) smr = GetComponentInChildren.<SkinnedMeshRenderer>();
	currentHealth = maxHealth;

	//disable all the death effects
	for(var effect : ParticleSystem in deathEffects){
		effect.Stop();
		effect.gameObject.SetActive(false);
	}
}

function TakeDamage(amount : int){
	currentHealth -= amount;

	//robot is dead
	if(currentHealth <= 0 && !isDead){
		isDead = true;
		for(var effect : ParticleSystem in deathEffects){
			effect.gameObject.SetActive(true);
			effect.Play();
		}
		Invoke("DeathExplosion", 10.0);
		stateMachine.enabled = false;
		agent.enabled = false;
		audioSource.PlayOneShot(deathSound, 1.0);
		ragdoll.goToRagdoll = true;
	}

}

function DeathExplosion(){
	//disable death effects
	for(var effect : ParticleSystem in deathEffects){
		effect.gameObject.SetActive(false);
		effect.Stop();
	}
	//instantiate the death explosion
	var newExplosion : GameObject = Instantiate(
		deathExplosion,
		smr.bounds.center + Vector3.up,
		Quaternion.identity);
	newExplosion.transform.forward = Vector3.up;
	ragdoll.rootRB.AddForce(Vector3.up * 10000.0);
}