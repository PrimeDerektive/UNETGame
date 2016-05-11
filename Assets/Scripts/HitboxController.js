#pragma strict

var hitboxes : Hitbox[];

function FindHitbox(id : byte) : Hitbox{
	for(var hitbox : Hitbox in hitboxes){
		if(hitbox.id == id){
			return hitbox;
		}
	}
}