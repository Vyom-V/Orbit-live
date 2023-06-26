class Obstacle {
    //same as projectile but no rotation
    constructor(x, y, radius, icon) {
      this.x = x;
      this.y = y;
      this.radius = radius * window.devicePixelRatio; //hitbox
      this.icon = icon;
      // this.velocity = velocity; //object with x and y velocity rates to move at angle
    }
  
    draw() {
      context.drawImage(
        playerIcons[this.icon],
        -(this.radius * 1.5)/2,
        -(this.radius * 1.5)/2,
        this.radius * 1.5,
        this.radius * 1.5,
      );
    }
  
    update() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    }
  }
  