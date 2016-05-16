using UnityEngine;
using System.Collections;

namespace RootMotion.FinalIK.Demos {

	/// <summary>
	/// The base abstract class for all character animation controllers.
	/// </summary>
	public abstract class CharacterAnimationBase: MonoBehaviour {

		// Gets the rotation pivot of the character
		public virtual Vector3 GetPivotPoint() {
			return transform.position;
		}

		// Is the animator playing the grounded state?
		public virtual bool animationGrounded { 
			get {
				return true;
			}
		}

		// Gets angle around y axis from a world space direction
		public float GetAngleFromForward(Vector3 worldDirection) {
			Vector3 local = transform.InverseTransformDirection(worldDirection);
			return Mathf.Atan2 (local.x, local.z) * Mathf.Rad2Deg;
		}
	}

}
