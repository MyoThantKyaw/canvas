import {Point} from "./point.js"
import { Curve } from "./curve.js";
export class Spline{
    constructor(){
        this.control_points = []

        this.id = undefined;

        // initial control points...
        this.start_pt = new Point(-5, -3);
        this.middle_pt = new Point(0, 2)
        this.end_pt = new Point(5, 3);
        this.curve = new Curve();
    }

    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;

        this.pt_px = stage.getPixFromCoor(this.pt_c.x, this.pt_c.y);
    }

    addControlPoint(){

    }

    removeControlPoint(){

    }

    pointToShap(x, y){
        
    }

}