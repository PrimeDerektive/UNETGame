#pragma strict

var speed : float = 3.0;
var smoothing : float = 5.0;
var jumpSpeed : float = 15.0;
var gravity : float = 10.0;
 
private var xSmooth : float = 0.0;
private var zSmooth : float = 0.0;
private var moveDirection = Vector3.zero;
private var grounded : boolean = false;



 
function FixedUpdate() {
    if (grounded) {

    	var xInput = Input.GetAxis("Horizontal");
    	var zInput = Input.GetAxis("Vertical");

    	//if the player is moving diagonally
        if(
	        (xInput == 1.0 || xInput == -1.0) &&
	        (zInput == 1.0 || zInput == -1.0)
        ){
        	//multiply both axes by 0.7071 so they can't move faster diagonally
        	xInput *= 0.7071;
        	zInput *= 0.7071;
        }

        //smooth the input out so the character moves smoothly
        xSmooth = Mathf.Lerp(xSmooth, xInput, Time.deltaTime * smoothing);
        zSmooth = Mathf.Lerp(zSmooth, zInput, Time.deltaTime * smoothing);

        moveDirection = new Vector3(xSmooth, 0, zSmooth);
        moveDirection = transform.TransformDirection(moveDirection);
        moveDirection *= speed;
       
        if (Input.GetButton ("Jump")) {
            moveDirection.y = jumpSpeed;
        }
    }
 
    // Apply gravity
    moveDirection.y -= gravity * Time.deltaTime;
   
    // Move the controller
    var controller : CharacterController = GetComponent(CharacterController);
    var flags = controller.Move(moveDirection * Time.deltaTime);
    grounded = (flags & CollisionFlags.CollidedBelow) != 0;
}
 
@script RequireComponent(CharacterController)
 