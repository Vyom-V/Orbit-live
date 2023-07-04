const Rectangle = require( "./Rectangle.js");

module.exports = class QuadTree{
    constructor(boundary, capacity){
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    //inserts a point into the quadtree
    insert(point){
        if(!this.boundary.isCollidingPoint(point)) return false;
        if(this.points.length < this.capacity){
            this.points.push(point);
            return true;
        }
        if(!this.divided) this.subdivide();
        return (
            this.northeast.insert(point) ||
            this.northwest.insert(point) ||
            this.southeast.insert(point) ||
            this.southwest.insert(point)
        );
    }

    //subdivides the quadtree into 4 quadrants
    subdivide(){
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.width;
        const h = this.boundary.height;

        const ne = new Rectangle(x + w/2, y - h/2, w/2, h/2);
        const nw = new Rectangle(x - w/2, y - h/2, w/2, h/2);
        const se = new Rectangle(x + w/2, y + h/2, w/2, h/2);
        const sw = new Rectangle(x - w/2, y + h/2, w/2, h/2);

        this.northeast = new QuadTree(ne, this.capacity);
        this.northwest = new QuadTree(nw, this.capacity);
        this.southeast = new QuadTree(se, this.capacity);
        this.southwest = new QuadTree(sw, this.capacity);

        this.divided = true;
    }

    //returns all the points in the range
    nearbyPoints(range, found){
        if(!found) found = [];
        if(!range.isColliding(this.boundary)) return found;
        for(let p of this.points){
            if(range.isCollidingPoint(p)) found.push(p);
        }
        if(this.divided){
            this.northeast.nearbyPoints(range, found);
            this.northwest.nearbyPoints(range, found);
            this.southeast.nearbyPoints(range, found);
            this.southwest.nearbyPoints(range, found);
        }
        return found;
    }

    //delete a point from the quadtree
    delete(point){
        if(!this.boundary.isCollidingPoint(point)) return false;
        if(this.points.includes(point)){
            this.points.splice(this.points.indexOf(point), 1);
            return true;
        }
        if(!this.divided) return false;
        return (
            this.northeast.delete(point) ||
            this.northwest.delete(point) ||
            this.southeast.delete(point) ||
            this.southwest.delete(point)
        );
    }
}