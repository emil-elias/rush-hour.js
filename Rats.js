//rat as child class of the enemy class ~ Emil

class Rat extends Enemy {

    //different perspectives 
    //~ Images: Thorben
    rat_d = new Image();
    rat_u = new Image();
    rat_l = new Image();
    rat_r = new Image();

    MapRef;

    constructor(map, tempX, tempY) {
        super(map, tempX, tempY); //set position based on parameters
        super.speed = 175; //different speed
        //load images
        this.rat_d.src = "./images/Rat_D.png";
        this.rat_u.src = "./images/Rat_U.png";
        this.rat_l.src = "./images/Rat_L.png";
        this.rat_r.src = "./images/Rat_R.png";
        this.determineDirection();
    }

    seePlayer() { //nothing happens, when rats see the player
    }

    //when a collision with the player is happening, a counter is counted up to determine for how long the collision is happening
    //the life counter only gets decreased once during the collision, when the duration is at value one, so that it is not decreased constantly and the player loses all of their lifes at once
    collisionAction() {

        if (this.collision()) {
            this.collisionDuration += 1;
        } else this.collisionDuration = 0;

        if (this.collisionDuration == 1) {
            lifeCount -= 1;
            SOUNDS.hit.play();
        }
    }

    draw() {
        //draw images based on moving direction
        if (this.vx > 0 && this.vy == 0) { //moving right
            context.drawImage(this.rat_r, this.x - screenLeftX - this.rat_r.width / 2, this.y - screenTopY - this.rat_r.height / 2);
        } else if (this.vx < 0 && this.vy == 0) { //moving left
            context.drawImage(this.rat_l, this.x - screenLeftX - this.rat_l.width / 2, this.y - screenTopY - this.rat_l.height / 2);
        } else if (this.vy > 0 && this.vx == 0) { //moving down
            context.drawImage(this.rat_d, this.x - screenLeftX - this.rat_d.width / 2, this.y - screenTopY - this.rat_d.height / 2);
        } else if (this.vy < 0 && this.vx == 0) { //moving up
            context.drawImage(this.rat_u, this.x - screenLeftX - this.rat_u.width / 2, this.y - screenTopY - this.rat_u.height / 2);
        } else { //fallback, rat from top facing upwards
            context.drawImage(this.rat_u, this.x - screenLeftX - this.rat_u.width / 2, this.y - screenTopY - this.rat_u.height / 2);
        }
    }
}