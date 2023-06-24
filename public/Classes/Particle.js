
const friction = 0.99;
class Particle {
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
      this.x,
      this.y,
      this.radius * 2,
      this.radius * 2
    );
  }

  update() {
    
    this.radius -= 0.05; //shrinks particles
    this.draw();
    this.velocity.x *= friction; //slows down particles
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}