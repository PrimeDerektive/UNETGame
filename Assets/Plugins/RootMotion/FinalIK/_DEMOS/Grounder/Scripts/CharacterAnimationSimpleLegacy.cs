using UnityEngine;
using System.Collections;

namespace RootMotion.FinalIK.Demos {
	
	/// <summary>
	/// Contols animation for a simple Legacy character
	/// </summary>
	public class CharacterAnimationSimpleLegacy: CharacterAnimationBase {

		[SerializeField] CharacterThirdPerson characterController;
		[SerializeField] new Animation animation; // Reference to the Animation component, in case it's not on this gameobject
		[SerializeField] float pivotOffset; // Offset of the rotating pivot point from the root
		[SerializeField] string idleName; // Name of the idle animation state
		[SerializeField] string moveName; // Name of the movement animation state
		[SerializeField] float idleAnimationSpeed = 0.3f; // The speed of idle animation
		[SerializeField] float moveAnimationSpeed = 0.75f; // The speed of movement animation
		[SerializeField] AnimationCurve moveSpeed; // The moving speed relative to input forward

		void Start() {
			// animation speeds
			animation[idleName].speed = idleAnimationSpeed;
			animation[moveName].speed = moveAnimationSpeed;
		}
		
		public override Vector3 GetPivotPoint() {
			return transform.position + transform.forward * pivotOffset;
		}
		
		// Update the Animator with the current state of the character controller
		void Update() {
			if (Time.deltaTime == 0f) return;
			
			// Crossfading
			if (characterController.animState.moveDirection.z > 0.4f) animation.CrossFade(moveName, 0.1f);
			else animation.CrossFade(idleName);
			
			// Moving
			characterController.Move(characterController.transform.forward * Time.deltaTime * moveSpeed.Evaluate(characterController.animState.moveDirection.z));
		}
	}
}

