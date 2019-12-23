import { Funcs } from "../utils/Funcs";

export class Length {
    
    constructor(item, is_circum_f = false) {
        this.item = item;
        this.area = undefined;

        this.circle_radius = false;
        this.circle_circumf = false;
        this.segment_len = false;

        if(item.constructor.name == "Segment"){
            this.segment_len = true;
        }
        else if(item.constructor.name == "Circle"){
            if(is_circum_f){
                this.circle_circumf = true;
            }
            else{
                this.circle_radius = true;
            }
        }
    }

    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;
    }

    update() {
        this.center = this.item.getCenterPoint();
        this.center = this.stage.getPixFromCoor(this.center.x, this.center.y);
        this.area = this.item.getArea();
    }

    render() {
        this.context.beginPath();
        this.context.fillStyle = "black";
        this.context.font = "10pt Calibri";

        if(this.segment_len){
            this.context.save();

            this.context.translate(this.center.x, this.center.y);
            this.context.rotate(-Math.PI / 4);
            this.context.textAlign = "center";
            this.context.fillText(this.area.toFixed(4), 0, -10);
            this.context.restore();
    
        }
        else if(this.circle_circumf){
            this.context.save();

            this.context.translate(this.center.x, this.center.y);
            this.context.rotate(-Math.PI / 4);
            this.context.textAlign = "center";
            this.context.fillText(this.area.toFixed(4), 0, -10);
            this.context.restore();
    
        }
        else if(this.circle_radius){
            this.context.save();

            this.context.translate(this.center.x, this.center.y);
            this.context.rotate(-Math.PI / 4);
            this.context.textAlign = "center";
            this.context.fillText(this.area.toFixed(4), 0, -10);
            this.context.restore();
        }
       
        this.context.setLineDash([])
    }

    name() {
        return "angle " + this.id;
    }
}