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
        // We are grounded, so recalculate movedirection directly from axes

        xSmooth = Mathf.Lerp(xSmooth, Input.GetAxis("Horizontal"), Time.deltaTime * smoothing);
        zSmooth = Mathf.Lerp(zSmooth, Input.GetAxis("Vertical"), Time.deltaTime * smoothing);

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
 