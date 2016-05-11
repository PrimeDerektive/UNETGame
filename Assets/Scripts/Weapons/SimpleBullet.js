#pragma strict

#pragma strict

var speed : float = 100;
var spread : float = 0.1;
var lifeTime : float = 0.5;
var dist : float = 10000;

private var spawnTime : float = 0.0;
private var tr : Transform;

function OnEnable () {
	tr = transform;
	tr.Rotate(
		Vector3(Random.Range(-spread, spread), Random.Range(-spread, spread), 0)
	);
	spawnTime = Time.time;
}

function Update () {
	tr.position += tr.forward * speed * Time.deltaTime;
	dist -= speed * Time.deltaTime;
	if (Time.time > spawnTime + lifeTime || dist < 0) {
		Destroy(gameObject);
	}
}