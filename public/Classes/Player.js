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
    context.arc(this.x - cam.x, this.y - cam.y, this.radius, 0, Math.PI * 2, false);
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

  //updates player direction based on mouse movemnt and keydown
  updateDirection(cam , animationID) {
    // this.draw();  //hitbox
    this.nameTag.draw( (this.x - cam.x) / devicePixelRatio , (this.y - cam.y) / devicePixelRatio );
    this.hpBar.draw( (this.x - cam.x) / devicePixelRatio , (this.y - cam.y) / devicePixelRatio , this.hp );
    let angleInRadians = this.angle + 1.5708;
    context.save();
    context.translate(this.x - cam.x, this.y - cam.y);
    context.rotate(angleInRadians);

    if(fired){
      context.drawImage(
        cannon,
        0 + (48 * (animationID % 12)), 
        0,
        48,
        48,
        -(this.radius * 2)/2,
        - 20 -(this.radius * 2)/2,
        this.radius * 2,
        this.radius * 2,
      );
    }
    else{
      context.drawImage(
        cannon,
        0, 
        0,
        48,
        48,
        -(this.radius * 3)/2,
        - 10 -(this.radius * 3)/2,
        this.radius * 3,
        this.radius * 3,
      );
    }

    context.drawImage(
      ship,
      // playerIcons[this.icon],
      -(this.radius * 3.5 )/2,
      -(this.radius * 3.5 )/2,
      this.radius * 3.5 ,
      this.radius * 3.5 ,
    );  

    context.drawImage(
      engineFlame,
      0 + (48 * Math.floor((animationID % 32) / 8) ),   //slow down animation
      0,
      24,
      48,
      -10 -(this.radius * 2)/2,
      -5 -(this.radius * 4)/2,
      this.radius * 2,
      this.radius * 4,
    );

    context.restore();
  }
}
