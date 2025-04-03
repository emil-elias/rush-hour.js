//ticket inspector as child class of the enemy class ~ Emil

class Inspector extends Enemy {
  
    //different perspectives 
    //~ Images: Thorben
    inspector_d = new Image();
    inspector_u = new Image();
    inspector_l = new Image();
    inspector_r = new Image();
    
    constructor(map, tempX, tempY) {
      super(map, tempX, tempY); //set position based on parameters
      //load images
      this.inspector_d.src = "./images/U-Bahn_Polizist_D.png";
      this.inspector_u.src = "./images/U-Bahn_Polizist_U.png";
      this.inspector_l.src = "./images/U-Bahn_Polizist_L.png";
      this.inspector_r.src = "./images/U-Bahn_Polizist_R.png";
      this.determineDirection();
    }
    
    draw() {
      
      //draw image based on moving direction
      if (this.vx > 0 && this.vy == 0) { //moving right
        context.drawImage(this.inspector_r, this.x-screenLeftX-this.inspector_r.width/2,this.y-screenTopY-this.inspector_r.height/2);
      } else if (this.vx < 0 && this.vy == 0) { //moving left
        context.drawImage(this.inspector_l, this.x-screenLeftX-this.inspector_l.width/2,this.y-screenTopY-this.inspector_l.height/2);
      } else if (this.vy > 0 && this.vx == 0) { //moving down
        context.drawImage(this.inspector_d, this.x-screenLeftX-this.inspector_d.width/2,this.y-screenTopY-this.inspector_d.height/2);
      } else if (this.vy < 0 && this.vx == 0) { //moving up
        context.drawImage(this.inspector_u, this.x-screenLeftX-this.inspector_u.width/2,this.y-screenTopY-this.inspector_u.height/2);
      } else { //fallback, inspector looking down
        context.drawImage(this.inspector_d, this.x-screenLeftX-this.inspector_d.width/2,this.y-screenTopY-this.inspector_d.height/2);
      }
    }
  }