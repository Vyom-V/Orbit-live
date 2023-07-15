class HpBar{
    constructor(x, y,hp,maxHp){
        this.x = x;
        this.y = y;
        this.color = "blue";
        this.hp = hp;
        this.maxHp = maxHp;
        this.elem = document.createElement("div");

        this.elem.style.left = this.x + 30 + "px";
        this.elem.style.top = this.y - 10 + "px";
        document.getElementById("gameOverlay").appendChild(this.elem);
        this.elem.classList.add("noSelect"); /* disables text selction */
        this.elem.classList.add("hpBar"); 
        this.draw(this.x,this.y,this.hp,this.maxHp);
        
    }
    draw(x,y,hp,maxHp){
        this.elem.innerHTML = "";
        while(hp >= 100){
            const hpBarSection = document.createElement("div");
            hpBarSection.style.backgroundColor = this.color;
            hpBarSection.style.width = (100/maxHp)*100 + "px";
            hpBarSection.classList.add("hpBarSection"); 
            hp -= 100;
            this.elem.appendChild(hpBarSection);
        }
        if(hp > 0){
            const hpBarSection = document.createElement("div");
            hpBarSection.style.backgroundColor = this.color;
            hpBarSection.style.width = (hp/maxHp)*100 + "px";
            hpBarSection.classList.add("hpBarSection"); 
            this.elem.appendChild(hpBarSection);
        }

        // this.elem.style.width = (hp/maxHp)*100 + "px";
        this.elem.style.left = x + 30 + "px";
        this.elem.style.top = y -10 + "px";
    }

    remove(){
        this.elem.remove();

    }
}