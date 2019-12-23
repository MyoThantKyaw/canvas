import { Funcs } from "../utils/Funcs";

export class Area {
    constructor(item) {
        this.item = item;
        this.area = undefined;
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

        this.context.save();

        this.context.translate(this.center.x, this.center.y);
        this.context.rotate(-Math.PI / 4);
        this.context.textAlign = "center";
        this.context.fillText(this.area.toFixed(4), 0, -10);
        this.context.restore();

        this.context.setLineDash([])
    }

    name() {
        return "angle " + this.id;
    }
}