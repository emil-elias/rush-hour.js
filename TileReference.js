//import Map from "./Map.js";

/**
 * NOTICE
 * This class was not originally written by me/us.
 * Sadly I don't know the exact author, but it was given to us in our Introduction to Programming class at the University of Bremen by Dr. Tim Laue.
 * I (Emil Wilde) just translated it from Processing into JavaScript and made some minor adjustments
 */

class TileReference {
    // Position in the map in tiles (int)
    x; y;

    // Position in the map in pixels (float)
    // This position definitely belong to the tile (x,y)
    // where it is on the tile depents on the function returning this reference
    xPixel; yPixel;

    tile; // Type of the tile (char)

    // Border of that tile in pixel (int)
    left; right; top; bottom;

    // Center of that tile in pixel (int)
    centerX; centerY;

    TileMap;

    /**
     * Creates a reference to the tile at (x,y)
     * all other components are taken from the map
     * 
     * @param {Map} map
     * @param {int} tmpX 
     * @param {int} tmpY 
     */
    constructor(map, tmpX, tmpY) {

        this.TileMap = map;

        this.x = tmpX; 
        this.y = tmpY;

        this.setBorders();

        this.xPixel = this.centerX;
        this.yPixel = this.centerY;
    }

    // Computes tile, left, right, top, bottom, centerX, centerY from referenced tile
    setBorders() {
        this.tile = this.TileMap.at(this.x, this.y);
        this.left = this.TileMap.leftOfTile(this.x);
        this.right = this.TileMap.rightOfTile(this.x);
        this.top = this.TileMap.topOfTile(this.y);
        this.bottom = this.TileMap.bottomOfTile(this.y);
        this.centerX = this.TileMap.centerXOfTile(this.x);
        this.centerY = this.TileMap.centerYOfTile(this.y);
    }

    /**
     * Consider the line xPixel, yPixel towards goalX, goalY.
     * This line must start in tile x, y.
     * Then advanceTowards follows this line until it leaves x, y
     * updating xPixel,yPixel with the point where it leaves
     * and the rest with the tile it enters.
     * 
     * @param {float} goalX 
     * @param {float} goalY 
     */
    advanceTowards(goalX, goalY) {
        let dX = goalX - this.xPixel;
        let dY = goalY - this.yPixel;

        // First try to go x until next tile
        let lambdaToNextX = Number.POSITIVE_INFINITY;

        if (dX > 0) {
            let nextX = (this.x+1)*this.TileMap.tileSize;
            lambdaToNextX = (nextX - this.xPixel)/dX;
        } else if (dX < 0) {
            let nextX = this.x*this.TileMap.tileSize;
            lambdaToNextX = (nextX - this.xPixel)/dX;
        }

        // Then try to go y until next tile
        let lambdaToNextY = Number.POSITIVE_INFINITY;

        if (dY > 0) {
            let nextY = (this.y+1)*this.TileMap.tileSize;
            lambdaToNextY = (nextY - this.yPixel)/dY;
        } else if (dY < 0) {
            let nextY = this.y*this.TileMap.tileSize;
            lambdaToNextY = (nextY - this.yPixel)/dY;
        }

        // Then choose which comes first x, y or goal
        if (lambdaToNextX <= lambdaToNextY && lambdaToNextX<1) { // Go x
            this.xPixel += dX*lambdaToNextX;
            this.yPixel += dY*lambdaToNextX;
            if (dX > 0) this.x++;
            else this.x--;
        }
        else if (lambdaToNextY<=lambdaToNextX && lambdaToNextY<1) { // Go y
            this.xPixel += dX*lambdaToNextY;
            this.yPixel += dY*lambdaToNextY;
            if (dY > 0) this.y++;
            else this.y--;
        } else { // reached goal in same cell
            this.xPixel = goalX;
            this.yPixel = goalY;
        }   

    }
}