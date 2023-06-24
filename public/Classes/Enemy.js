
class Enemy {
    //same as projectile but no rotation
    constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity; //object with x and y velocity rates to move at angle
    }
  
    draw() {
      context.drawImage(
        meteors,
        this.x-this.radius,
        this.y-this.radius,
        this.radius * 2,
        this.radius * 2
      );
    }
  
    update() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    }
  }