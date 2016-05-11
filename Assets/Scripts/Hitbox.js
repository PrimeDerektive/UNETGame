#pragma strict

var id : byte;
var col : Collider;

function Start () {
	if(!col) col = GetComponent.<Collider>();
}