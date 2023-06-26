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
    this.hpBar = new HpBar(this.x, this.y, this.hp);
  }

  draw() {
    //draws htibox
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = "blue";
    context.fill();
  }

  drawHpBar(cam) {
    //draws hp bar
    context.beginPath();
    context.rect(this.x - cam.x + 30 , this.y - cam.y -30, this.hp*1.5, 8);
    context.fillStyle = "blue";
    context.fill();
  }

  updateDirection(cam) {
    //updates player direction based on mouse movemnt and keydown
    // this.draw();  //hitbox
    // this.drawHpBar(cam);
    this.nameTag.draw( (this.x - cam.x) / devicePixelRatio , (this.y - cam.y) / devicePixelRatio );
    this.hpBar.draw( (this.x - cam.x) / devicePixelRatio , (this.y - cam.y) / devicePixelRatio , this.hp );
    let angleInRadians = this.angle + 1.5708;
    context.save();
    context.translate(this.x - cam.x, this.y - cam.y);
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
