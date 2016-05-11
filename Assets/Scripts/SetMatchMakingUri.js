#pragma strict

function Start(){
	NetworkManager.singleton.SetMatchHost("eu1-mm.unet.unity3d.com", 443, true);
}