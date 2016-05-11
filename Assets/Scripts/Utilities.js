﻿#pragma strict

//this function calculates the target rotation angle of an object
//that is turning, relative to the target direction

static function FindNetworkObject(id : uint) : NetworkIdentity{
	var netObjects : NetworkIdentity[] = FindObjectsOfType(NetworkIdentity) as NetworkIdentity[];
	for (var netObject : NetworkIdentity in netObjects){
		if(netObject.netId.Value == id){
			return netObject;
		}
	}
}

static function FindTurningAngle(currentForward : Vector3, targetForward : Vector3) : float{
	targetForward.y = currentForward.y; // kill Y
    var axis = Vector3.Cross(currentForward, targetForward);
	return Vector3.Angle(currentForward, targetForward) * (axis.y < 0 ? -1 : 1);
}

//this function does exactly what it sounds like
static function LerpPositionOverTime(tr : Transform, start : Vector3, end : Vector3, duration : float) : IEnumerator{
    var i = 0.0;
    var rate = 1.0/duration;
    while (i < 1.0){
        i += Time.deltaTime * rate;
        tr.position = Vector3.Lerp(start, end, i);
        yield; 
    }
}