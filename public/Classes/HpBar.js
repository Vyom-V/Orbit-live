class HpBar{
    constructor(x, y,hp){
        this.x = x;
        this.y = y;
        this.color = "blue";
        this.hp = hp;
        this.elem = document.createElement("div");

        this.elem.style.backgroundColor = this.color;
        this.elem.style.position = "absolute";
        this.elem.style.width = this.hp + "px";
        this.elem.style.height = 5 + "px";
        this.elem.style.zIndex = "1";
        this.elem.style.left = this.x + 30 + "px";
        this.elem.style.top = this.y - 10 + "px";
        document.getElementById("gameOverlay").appendChild(this.elem);
        this.elem.classList.add("noSelect"); /* disables text selction */
        
    }
    draw(x,y,hp){
        this.elem.style.width = hp + "px";
        this.elem.style.left = x + 30 + "px";
        this.elem.style.top = y -10 + "px";
    }
}