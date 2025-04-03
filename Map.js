//import TileReference from "./TileReference.js";

/**
 * NOTICE
 * This class was not originally written by me/us.
 * Sadly I don't know the exact author, but it was given to us in our Introduction to Programming class at the University of Bremen by Dr. Tim Laue.
 * I (Emil Wilde) just translated it from Processing into JavaScript and made some minor adjustments
 */

const CORNER = 0;
const CENTER = 1;
const CORNERS = 2;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Map {

    map = [];   // tile x, y is map[y].charAt(x)
    images = []; // images[c-'A'] is the image for tile c
    outsideImage; // special image drawn outside the map
    w; h; // map dimensions in tiles
    tileSize; // width and height of an element in pixels
    mode = CORNER;
    canvas = document.getElementById("canvas");
    context = this.canvas.getContext('2d');

    /**
     * Constructor: tmptileSize is the width/height of one tile in pixel
     * 
     * @param {int} tmpTileSize 
     */
    /*constructor(tmpTileSize) {
        this.tileSize = tmpTileSize;
        this.images = new Array(26);
    }*/

    /**
     * Constructor: Loads a map file
     * 
     * @param {Strings Array} mapFile 
     */
    constructor(mapFile) {
        this.images = new Array(26);

        this.loadFile(mapFile);
    }

    /**
     * ! Sets the mode in which coordinates are specified, supported is CORNER, CENTER, CORNERS
     * 
     * @param {int} tmpMode 
     */
    mode(tmpMode) {
        this.mode = tmpMode;
    }

    get widthPixel() {
        return this.w * this.tileSize;
    }

    get heightPixel() {
        return this.h * this.tileSize;
    }

    // 
    /**
     * Left border (pixel) of the tile at tile position x
     * 
     * @param {int} x 
     * @returns int
     */
    leftOfTile(x) {
        return x * this.tileSize;
    }

    /**
     * Right border (pixel) of the tile at tile position x
     * 
     * @param {int} x 
     * @returns int
     */
    rightOfTile(x) {
        return (x + 1) * this.tileSize - 1;
    }

    /**
     * Top border (pixel) of the tile at tile position y
     * 
     * @param {int} y 
     * @returns int
     */
    topOfTile(y) {
        return y * this.tileSize;
    }

    /**
     * Bottom border (pixel) of the tile at tile position y
     * 
     * @param {int} y 
     * @returns int 
     */
    bottomOfTile(y) {
        return (y + 1) * this.tileSize - 1;
    }

    /**
     * ! Center of the tile at tile position x
     * 
     * @param {int} x 
     * @returns int
     */
    centerXOfTile(x) {
        return x * this.tileSize + this.tileSize / 2;
    }

    /**
     * ! Center of the tile at tile position y
     * 
     * @param {int} y 
     * @returns int
     */
    centerYOfTile(y) {
        return y * this.tileSize + this.tileSize / 2;
    }

    /**
     * Returns the tile at tile position x,y. '_' for invalid positions (out of range)
     * 
     * @param {int} x 
     * @param {int} y 
     * @returns char
     */
    at(x, y) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return '_';
        else return this.map[y][x];
    }

    /**
     * Returns the tile at pixel position 'x,y', '_' for invalid
     * 
     * @param {float} x 
     * @param {float} y 
     * @returns char
     */
    atPixel(x, y) {
        return this.at(Math.floor(x / this.tileSize), Math.floor(y / this.tileSize));
    }

    /**
     * Sets the tile at tile position x,y
     * Coordinates below 0 are ignored, for coordinates
     * beyond the map border, the map is extended
     * 
     * @param {int} x 
     * @param {int} y 
     * @param {char} ch 
     */
    set(x, y, ch) {
        if (x < 0 || y < 0) return;
        this.extend(x + 1, y + 1);
        this.map[y] = this.replace(this.map[y], x, ch);
    }

    /**
     * Returns a reference to a given pixel and its tile
     * 
     * @param {float} pixelX 
     * @param {float} pixelY 
     * @returns {TileReference}
     */
    newRefOfPixel(pixelX, pixelY) {
        let ref = new TileReference(this, Math.floor(pixelX / this.tileSize), Math.floor(pixelY / this.tileSize));
        ref.xPixel = pixelX;
        ref.yPixel = pixelY;
        return ref;
    }

    /**
     * True if the rectangle given by x, y, w, h (partially) contains an element with a tile
     * from list. The meaning of x,y,w,h is governed by mode (CORNER, CENTER, CORNERS).
     * 
     * @param {float} x 
     * @param {float} y 
     * @param {float} w 
     * @param {float} h 
     * @param {String} list 
     * @returns {Boolean}
     */
    testTileInRect(x, y, w, h, list) {
        if (this.mode == CENTER) {
            x -= w / 2;
            y -= w / 2;
        }

        if (this.mode == CORNERS) {
            w = w - x;
            h = h - y;
        }

        let startX = Math.floor(x / this.tileSize);
        let startY = Math.floor(y / this.tileSize);
        let endX = Math.floor((x + w) / this.tileSize);
        let endY = Math.floor((y + h) / this.tileSize);

        for (let xx = startX; xx <= endX; ++xx) {
            for (let yy = startY; yy <= endY; ++yy) {
                if (list.indexOf(this.at(xx, yy)) != -1) return true;
            }
        }

        return false;
    }

    /**
     * Like testtileInRect(...) but returns a reference to the tile if one is found
     * and null else. The meaning of x,y,w,h is governed by mode (CORNER, CENTER, CORNERS).
     * 
     * @param {float} x 
     * @param {float} y 
     * @param {float} w 
     * @param {float} h 
     * @param {String} list 
     * @returns {TileReference|null}}
     */
    findTileInRect(x, y, w, h, list) {
        if (this.mode == CENTER) {
            x -= w / 2;
            y -= w / 2;
        }

        if (this.mode == CORNERS) {
            w = w - x;
            h = h - y;
        }

        let startX = Math.floor(x / this.tileSize);
        let startY = Math.floor(y / this.tileSize);
        let endX = Math.floor((x + w) / this.tileSize);
        let endY = Math.floor((y + h) / this.tileSize);

        for (let xx = startX; xx <= endX; ++xx) {
            for (let yy = startY; yy <= endY; ++yy) {
                if (list.indexOf(this.at(xx, yy)) != -1) return new TileReference(this, xx, yy);
            }
        }

        return null;
    }

    /**
     * Like findTileInRect(...) but returns a reference to the tile closest to the center
     * 
     * @param {float} x 
     * @param {float} y 
     * @param {float} w 
     * @param {float} h 
     * @param {String} list 
     * @returns {TileReference|null}}
     */
    findClosestTileInRect(x, y, w, h, list) {
        if (mode == CENTER) {
            x -= w / 2;
            y -= w / 2;
        }

        if (mode == CORNERS) {
            w = w - x;
            h = h - y;
        }

        let centerX = x + w / 2;
        let centerY = y + h / 2;

        let startX = Math.floor(x / this.tileSize);
        let startY = Math.floor(y / this.tileSize);
        let endX = Math.floor((x + w) / this.tileSize);
        let endY = Math.floor((y + h) / this.tileSize);

        let xFound = -1;
        let yFound = -1;
        let dFound = Number.POSITIVE_INFINITY;

        for (let xx = startX; xx <= endX; ++xx) {
            for (let yy = startY; yy <= endY; ++yy) {
                if (list.indexOf(this.at(xx, yy)) != -1) {
                    // calc distance
                    let a = centerX - this.centerXOfTile(xx);
                    let b = centerY - this.centerYOfTile(yy)

                    let d = Math.sqrt(a * a + b * b);

                    if (d < dFound) {
                        dFound = d;
                        xFound = xx;
                        yFound = yy;
                    }
                }
            }
        }

        if (dFound < Number.POSITIVE_INFINITY) return new TileReference(this, xFound, yFound);
        else return null;

    }

    /**
     * True if the rectangle is completely inside tiles from the list
     * The meaning of x,y,w,h is governed by mode (CORNER, CENTER, CORNERS).
     * 
     * @param {float} x 
     * @param {float} y 
     * @param {float} w 
     * @param {float} h 
     * @param {String} list 
     * @returns {Boolean}
     */
    testTileFullyInsideRect(x, y, w, h, list) {
        if (this.mode == CENTER) {
            x -= w / 2;
            y -= w / 2;
        }

        if (this.mode == CORNERS) {
            w = w - x;
            h = h - y;
        }

        let startX = Math.floor(x / this.tileSize);
        let startY = Math.floor(y / this.tileSize);
        let endX = Math.floor((x + w) / this.tileSize);
        let endY = Math.floor((y + h) / this.tileSize);

        for (let xx = startX; xx <= endX; ++xx) {
            for (let yy = startY; yy <= endY; ++yy) {
                if (list.indexOf(this.at(xx, yy)) == -1) return false;
            }
        }

        return true;
    }

    findTileOnLine(x1, y1, x2, y2, list) {
        let ref = this.newRefOfPixel(x1, y1);
        let ctr = 0;
        let maxCtr = Math.floor(Math.abs(x1 - x2) + Math.abs(y1 - y2)) / this.tileSize + 3;

        while (ctr <= maxCtr && (ref.xPixel != x2 || ref.yPixel != y2)) {
            if (ctr > 0) ref.advanceTowards(x2, y2);
            if (list.indexOf(this.at(ref.x, ref.y)) != -1) {
                ref.setBorders();
                return ref;
            }
            ctr++;
        }
        if (ctr > maxCtr) console.log("Internal error in Map:findTileOnLine");
        return null;

    }

    /**
     * Returns, wether on the line from x1,y1 to x2,y2 there is a tile from list
     * 
     * @param {float} x1 
     * @param {float} y1 
     * @param {float} x2 
     * @param {float} y2 
     * @param {String} list 
     * @returns {Boolean}
     */
    testTileOnLine(x1, y1, x2, y2, list) {
        return this.findTileOnLine(x1, y1, x2, y2, list) != null;
    }

    /**
     * Draws the map on the screen, where the origin, i.e. left/upper
     * corner of the map is drawn at \c leftX, topY regardless of mode
     * 
     * @param {float} leftX 
     * @param {float} topY 
     */
    draw(leftX, topY) {
        //pushStyle()
        //imageMode(CORNER)

        let startX = Math.floor(-leftX / this.tileSize);
        let startY = Math.floor(-topY / this.tileSize);

        for (let y = startY; y < startY + this.canvas.getBoundingClientRect().height / this.tileSize + 2; ++y) {
            for (let x = startX; x < startX + this.canvas.getBoundingClientRect().width / this.tileSize + 2; ++x) {
                let img = undefined;
                let tile = this.at(x, y);
                if (tile == '_') img = this.outsideImage;
                else if ('A' <= tile && tile <= 'Z') img = this.images[alphabet.indexOf(this.at(x, y))];
                if (img != undefined) {
                    this.context.drawImage(img, x * this.tileSize + leftX, y * this.tileSize + topY, this.tileSize, this.tileSize);
                }
            }
        }

        //popStyle()
    }

    /**
     * Loads a map file
     * element size is obtained from the first image loaded
     * 
     * @param {String} mapFile 
     */
    loadFile(mapFile) {



        this.map = [...mapFile];

        if (this.map == undefined) {
            throw new Error("Map not found");
        }

        while (this.map.length > 0 && this.map[this.map.length - 1] == "") {
            this.map.pop();
        }

        this.h = this.map.length;

        if (this.h == 0) {
            throw new Error("Map has zero size");
        }

        this.w = this.map[0].length;

        // Load images
        for (let c = 0; c <= 25; c++) {

            this.images[c] = this.loadImage(alphabet[c]);
            
        }

        this.outsideImage = this.loadImage("_");

        for (let y = 0; y < this.h; ++y) {
            let line = this.map[y];

            if (line.length != this.w) {
                throw new Error("Not every line in map of same length");
            }

            for (let x = 0; x < line.length; ++x) {
                let c = line[x];
                if (c == " " || c == "_") { }
                else if ('A' <= c && c <= 'Z') {
                    //if (this.images[alphabet.indexOf(c)] == null) throw new Error("Image for " + c + ".png missing");
                }
                else throw new Error("map must only contain A-Z, space or _");
            }
        }

        this.context.font = "30px Arial";
        this.context.fillStyle = "white";
        this.context.fillText("If you see this, please try to reload the page", 200, this.canvas.height/2);

        this.determinetileSize();


    }

    /**
     * load Image
     * 
     * @param {String} imageFilename 
     * @returns 
     */
    loadImage(imageFilename) {


        //let img = new Image();
        //img.src = "./images/" + imageFilename;

        let img = document.getElementById(imageFilename);

        

        if (img == undefined || img.height == 0 || img.width == 0) return null;


        /*img.onerror = function() {
            return null;
        }*/

        return img;


    }

    /**
     * Internal: Loads an image named imageName from a locatation relative
     * to the map file mapFile. It must be either in the same
     * directory, or in a subdirectory images, or in a parallel
     * directory images.
     * 
     * @param {String} mapFile 
     * @param {String} imageName 
     */
    loadImageRelativeToMap(mapFile, imageName) {

    }

    // Goes through all images loaded and determine stileSize as amx
    // If image sizes are not square and equal a warning message is printed
    determinetileSize() {

        this.tileSize = 0;

        let allImages = this.images.concat(this.outsideImage);

        for (let i = 0; i < allImages.length; ++i) {
            if (allImages[i] != null && allImages[i] != undefined) {
                if (this.tileSize > 0 && (allImages[i].width != this.tileSize || allImages[i].height != this.tileSize)) {
                    console.log("WARNING: Images are not square and of same size");
                }
                if (allImages[i].width > this.tileSize) this.tileSize = allImages[i].width;
                if (allImages[i].height > this.tileSize) this.tileSize = allImages[i].height;
            }
        }

        //if (this.tileSize == 0) throw new Error("No image could be loaded");
    }

    /**
     * If the dimension of the map is below width times height
     * _ are appended in each line and full lines are appended
     * such that it is width times height.
     * 
     * @param {int} width 
     * @param {int} height 
     */
    extend(width, height) {
        while (height > this.h) {
            this.map.push("");
            this.h++;
        }

        if (this.w < width) this.w = width;

        for (let y = 0; y < this.h; y++) {
            while (this.map[y].length < this.w) {
                this.map[y] = this.map[y] + "_";
            }
        }
    }

    /**
     * Replaces s.[index] with ch
     * 
     * @param {String} s 
     * @param {int} index 
     * @param {char} ch 
     * @returns String
     */
    replace(s, index, ch) {
        return s.substring(0, index) + ch + s.substring(index + 1, s.length);
    }



}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}