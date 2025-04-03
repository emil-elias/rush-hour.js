//Enemy base class ~ Emil

class Enemy {

    x; y; //position
    vx; vy; //velocity
    speed = 100; //speed at which the enemy moves

    vertical = 1; horizontal = 2; //to define if object is moving vertically or horizontally

    collisionDuration = 0; //used to count up while a collision is happening to determine if it is still happening or over

    TileMap;

    constructor(map, tempX, tempY) {
        //position gets set based on input parameters
        this.x = tempX;
        this.y = tempY;
        this.TileMap = map;

        //determine moving direction based on surrounding tiles
        this.determineDirection();
    }

    draw() {

    }


    //determine moving direction based on surrounding tiles
    //lots of if/else...
    //tests if surrounding tiles are floor tiles to determine which direction to move next
    //if there are multilple options, choice is random
    //sometimes in rare cases, objects don't start moving or stop at corners, i don't know why. It's not a bug though, it's a feature to trick the player ;) (most of the time they start moving again when the player comes too close)
    determineDirection() {

        let left = this.TileMap.atPixel(this.x - 62, this.y) == 'B' || this.TileMap.atPixel(this.x - 62, this.y) == 'G'; //true if tile left from current tile is floor or money (x-62 points from the center of the current tile to the center of the adjacent tile on the left)
        let right = this.TileMap.atPixel(this.x + 62, this.y) == 'B' || this.TileMap.atPixel(this.x + 62, this.y) == 'G'; //true if tile right from current tile is floor or money
        let top = this.TileMap.atPixel(this.x, this.y - 62) == 'B' || this.TileMap.atPixel(this.x, this.y - 62) == 'G'; //true if tile above current tile is floor or money
        let bottom = this.TileMap.atPixel(this.x, this.y + 62) == 'B' || this.TileMap.atPixel(this.x, this.y + 62) == 'G'; //true if tile beneath current tile is floor or money

        //yes, these are all relevant possibilities...

        if (bottom && !left && !top && !right) { //if bottom is the only possible direction, go down
            this.goDown();
        } else if (top && !bottom && !left && !right) { //if top is the only possible direction, go up
            this.goUp();
        } else if (right && !left && !bottom && !top) { //if right is the only possible direction, go right
            this.goRight();
        } else if (left && !right && !bottom && !top) { //if left is the only possible direction, go left
            this.goLeft();
        } else if (bottom && right && !left && !top) { //bottom and right possible
            let selector = Math.random(0, 1); //random selection
            if (selector > 0.5) {
                this.goDown();
            } else {
                this.goRight();
            }
        } else if (bottom && right && left && !top) { //bottom and right and left possible
            let selector = Math.random(0, 1);
            if (selector < 0.33) {
                this.goDown();
            } else if (selector > 0.66) {
                this.goLeft();
            } else this.goRight();
        } else if (bottom && right && left && top) { //all directions possible
            let selector = Math.random(0, 1);
            if (selector < 0.25) this.goUp();
            else if (selector > 0.25 && selector < 0.5) this.goDown();
            else if (selector > 0.5 && selector < 0.75) this.goRight();
            else this.goLeft();
        } else if (bottom && left && !right && !top) { //bottom and left possible
            let selector = Math.random(0, 1);
            if (selector > 0.5) {
                this.goDown();
            } else {
                this.goLeft();
            }
        } else if (right && left && top && !bottom) { //bottom and left and right possible
            let selector = Math.random(0, 1);
            if (selector < 0.33) {
                this.goUp();
            } else if (selector > 0.66) {
                this.goLeft();
            } else this.goRight();
        } else if (top && left && !bottom && !right) { //top and left possible
            let selector = Math.random(0, 1);
            if (selector < 0.33) {
                this.goUp();
            } else if (selector > 0.66) {
                this.goLeft();
            } else this.goRight();
        } else if (top && right && !left && !bottom) { //top and right possible
            let selector = Math.random(0, 1);
            if (selector < 0.33) {
                this.goUp();
            } else if (selector > 0.66) {
                this.goLeft();
            } else this.goRight();
        } else if (bottom && left && top && !right) { //bottom and left and top possible
            let selector = Math.random(0, 1);
            if (selector < 0.33) {
                this.goDown();
            } else if (selector > 0.66) {
                this.goLeft();
            } else this.goUp();
        } else if (bottom && right && top && !left) { //bottom and right and top possbile
            let selector = Math.random(0, 1);
            if (selector < 0.33) {
                this.goDown();
            } else if (selector > 0.66) {
                this.goUp();
            } else this.goRight();
        }
    }

    //determines moving direction based on velocity
    movingDirection() {
        if (this.vx == 0 && this.vy != 0) { //vx == 0 means no moving on horizontal axis, hence vertical if vy not also zero
            return this.vertical;
        } else if (this.vy == 0 && this.vx != 0) { //vy == 0 means no moving on vertical axis, hence horizonatl if vx not also zero
            return this.horizontal;
        } else return 0; //else object is not moving
    }

    //determines if enemy can see player and what happens in that case
    //enemy speeds up towards player if player is in line of sight of the enemy
    seePlayer() {
        if (this.movingDirection() == this.horizontal && playerY <= this.y + 31 && playerY >= this.y - 31 && !this.TileMap.testTileOnLine(this.x, this.y, playerX, playerY, "W")) { //enemy is moving horizontally, player is inside the horizontal tile row on which the enemy is moving and there is no wall tile between the two blocking the view

            //double vx speed
            if (playerX <= this.x && this.vx < 0) { //player is left from enemy, so negative speed
                this.vx = -this.speed * 2;
            } else if (playerX >= this.x && this.vx > 0) { //player is right from enemy
                this.vx = this.speed * 2;
            }
            this.vy = 0;
        } else if (this.movingDirection() == this.vertical && playerX <= this.x + 31 && playerX >= this.x - 31 && !this.TileMap.testTileOnLine(this.x, this.y, playerX, playerY, "W")) { //enemy is moving vertically, player is inside the vertical tile row on which the enemy is moving and there is no wall tile between the two blocking the view

            //double vy speed
            if (playerY <= this.y && this.vy < 0) { //player is above enemy, so negative speed
                this.vy = -this.speed * 2;
            } else if (playerY >= this.y && this.vy > 0) { //player is beneath enemy
                this.vy = this.speed * 2;
            }
            this.vx = 0;
        } else { //if player leaves line of sight go back to normal speed based on moving direction
            if (this.vx > 0) {
                this.vx = this.speed;
                this.vy = 0;
            } else if (this.vx < 0) {
                this.vx = -this.speed;
                this.vy = 0;
            } else if (this.vy > 0) {
                this.vy = this.speed;
                this.vx = 0;
            } else if (this.vy < 0) {
                this.vy = -this.speed;
                this.vx = 0;
            }
        }
    }

    //functions to change directions
    goRight() {
        this.vx = this.speed;
        this.vy = 0;
    }

    goLeft() {
        this.vx = -this.speed;
        this.vy = 0;
    }

    goDown() {
        this.vx = 0;
        this.vy = this.speed;
    }

    goUp() {
        this.vx = 0;
        this.vy = -this.speed;
    }

    //tests if enemy collides with player - the hitbox of the enemy is a 64x64 rectangle covering an entire tile
    //~ Thorben
    collision() {
        return (playerX - playerR <= this.x + 32 && playerX + playerR >= this.x - 32 && playerY - playerR <= this.y + 32 && playerY + playerR >= this.y - 32);
    }

    //what happens in case of a collision
    collisionAction() {
    }

    move() {

        //calculates next position, position + velocity
        let nextX = this.x + this.vx/fps;
        let nextY = this.y + this.vy/fps;
    
        this.seePlayer(); //enemy can see and react to player
    
        //if enemy hits wall, train or map edge, determine new direction
        //the hitbox is a bit smaller than 64x64 because otherwise it would collide with walls constantly
        //at turns, this sometimes causes the center position of the object to shift a very tiny bit from the center of the tile, but that shouldn't be noticable or have any greater effects within the 60 seconds of play
        if (this.TileMap.testTileInRect (nextX-31, nextY-31, 62, 62, "W_RAUC")) {
          this.determineDirection();
    
          nextX = this.x;
          nextY = this.y;
        }
    
        if (this.vx == 0 && this.vy == 0) { //should the enemy stop (because whatever), determine a new direction
          this.determineDirection();
        }
    
        //update position
        this.x = nextX;
        this.y = nextY;
      }

}