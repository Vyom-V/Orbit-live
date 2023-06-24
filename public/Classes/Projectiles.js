
class Projectile {
    constructor(x, y, radius, color, velocity, angle) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity; //object with x and y velocity rates to move at angle
      this.angle = angle;
    }
  
    draw() {
      // context.beginPath();
      // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      // context.fillStyle = this.color;
      // context.fill();
      context.translate(this.x, this.y);
      context.rotate(this.angle + 1.5708);
      context.drawImage(rockets, -2.5, -5, 5, 25);
      context.rotate(-this.angle - 1.5708);
      context.translate(-this.x, -this.y);
    }
  
    update() {
      this.draw();
      this.x = this.x + this.velocity.x * 6;
      this.y = this.y + this.velocity.y * 6;
    }
  }