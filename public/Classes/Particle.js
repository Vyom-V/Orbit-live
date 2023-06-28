
class Particle {
  //same as projectile but no rotation
  constructor({x, y, type}) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 7;
    this.type = type;
    this.velocity =  {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6),
          },
    this.friction = 0.99;

  }

  draw() {
    context.drawImage(
      meteorIcons[this.type],
      this.x - cam.x,
      this.y - cam.y,
      this.radius * 2,
      this.radius * 2
    );
  }

  update() {
    
    this.radius -= 0.05; //shrinks particles
    this.draw();
    this.velocity.x *= this.friction; //slows down particles
    this.velocity.y *= this.friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}