class Player {
    constructor(x, y, radius, icon) {
      this.x = x;
      this.y = y;
      this.radius = radius * window.devicePixelRatio;
      this.icon = icon;
      this.angle = -1.5708;
      this.velocity = {
        x: 0,
        y: 0,
      };
    }
  
    draw() { //draws htibox
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      context.fillStyle = 'blue';
      context.fill();
    }
  
    updateDirection() {
      //updates player direction based on mouse movemnt
      let angleInRadians = this.angle + 1.5708;
      // this.draw();  //hitbox
      if (
        this.x + this.velocity.x < canvas.width - this.radius &&
        this.x + this.velocity.x > this.radius
      )
        this.x = this.x + this.velocity.x;
      if (
        this.y + this.velocity.y < canvas.height - this.radius &&
        this.y + this.velocity.y > this.radius
      )
        this.y = this.y + this.velocity.y;
      context.translate(this.x, this.y);
      context.rotate(angleInRadians);
      context.drawImage(
        playerIcons[this.icon],
        -this.radius / 2,
        -this.radius / 2,
        this.radius,
        this.radius
      );
      context.drawImage(
        shield,
        -this.radius,
        -this.radius,
        this.radius * 2,
        this.radius * 2
      );
      context.rotate(-angleInRadians);
      context.translate(-this.x, -this.y);
    }
  }
