class Player {
  constructor(x, y, radius, icon, hp , name) {
    this.x = x;
    this.y = y;
    this.radius = radius * window.devicePixelRatio;
    this.icon = icon;
    this.angle = -1.5708;
    this.hp = hp;
    this.name = name;
    this.nameTag = new NameTag(this.x, this.y, this.name); 
  }

  draw() {
    //draws htibox
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = "blue";
    context.fill();
  }

  drawHpBar() {
    //draws hp bar
    context.beginPath();
    context.rect(this.x + 30 , this.y - 30, this.hp*1.5, 8);
    context.fillStyle = "blue";
    context.fill();
  }

  updateDirection() {
    //updates player direction based on mouse movemnt and keydown
    // this.draw();  //hitbox
    this.nameTag.draw(this.x / devicePixelRatio , this.y / devicePixelRatio);
    this.drawHpBar();

    let angleInRadians = this.angle + 1.5708;
    context.save();
    context.translate(this.x, this.y);
    context.rotate(angleInRadians);
    context.drawImage(
      playerIcons[this.icon],
      -(this.radius * 1.5)/2,
      -(this.radius * 1.5)/2,
      this.radius * 1.5,
      this.radius * 1.5,
    );
    context.restore();
  }
}
