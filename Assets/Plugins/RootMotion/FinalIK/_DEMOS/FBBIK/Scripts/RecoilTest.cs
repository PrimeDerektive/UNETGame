using UnityEngine;
using System.Collections;

namespace RootMotion.FinalIK.Demos {

	/// <summary>
	/// Just for testing out the Recoil script.
	/// </summary>
	public class RecoilTest : MonoBehaviour {

		public Recoil recoil;
		public float magnitude = 1f;

		void Update() {
			if (Input.GetKeyDown(KeyCode.R)) recoil.Fire(magnitude);
		}

		void OnGUI() {
			GUILayout.Label("Press R for procedural recoil.");
		}

	}
}
