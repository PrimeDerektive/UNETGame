#pragma strict
import UnityEngine.Networking;


public class NetworkHealth extends NetworkBehaviour{


	var maxHealth : int = 100;

	@SyncVar(hook="OnHealthUpdate")
	var currentHealth : int = maxHealth;

	function TakeDamage(amount : int){

		//only the server directly manipulates health values
		if(!isServer) return;

		//deduct the  amount
		currentHealth -= amount;

		if(currentHealth <= 0){
			Destroy(gameObject);
		}

	}

	function OnHealthUpdate(newHealth : int){
		 currentHealth = newHealth;
		 if(currentHealth <= 0){
		 	Destroy(gameObject);
		 }
	}

}