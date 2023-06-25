class NameTag{
    constructor(x, y,name){
        this.x = x;
        this.y = y;
        this.sz = 10;
        this.color = "white";
        this.name = name;
        this.elem = document.createElement("div");

        this.elem.innerHTML = this.name;
        this.elem.style.color = this.color;
        this.elem.style.position = "absolute";
        this.elem.style.width = this.sz + "px";
        this.elem.style.height = 5 + "px";
        this.elem.style.backgroundColor = "rgba(0, 0, 0, 0)";
        this.elem.style.zIndex = "1";
        this.elem.style.left = this.x - 10 + "px";
        this.elem.style.top = this.y -10 + "px";
        document.body.appendChild(this.elem);
        this.elem.classList.add("noSelect"); /* disables text selction */
        
    }
    draw(x,y){
        this.elem.style.left = x - 20 + "px";
        this.elem.style.top = y - 40 + "px";
    }
}