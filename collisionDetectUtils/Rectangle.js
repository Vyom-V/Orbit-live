module.exports = class Rectangle{
    // x and y are the center of the rectangle 
    // width and height are the half width and height of the rectangle
    constructor(x,y,width,height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // returns true if the rectangle is colliding with the other rectangle
    isColliding(other){
        return (
            this.x - this.width < other.x + other.width &&
            this.x + this.width > other.x - other.width &&
            this.y - this.height < other.y + other.height &&
            this.y + this.height > other.y - other.height
        );
    }

    // returns true if the rectangle is colliding with the point
    isCollidingPoint(point){
        return (
            this.x - this.width < point.x &&
            this.x + this.width > point.x &&
            this.y - this.height < point.y &&
            this.y + this.height > point.y
        );
    }
}