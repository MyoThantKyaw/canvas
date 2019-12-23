import { Funcs } from "../utils/Funcs.js"

export class SmallPoint {
    constructor(x, y, radius = 3.5, color = "#34393E") {
        this.pt_c = { x: x, y: y };
        this.r = radius;
        this.core_color = Funcs.getRBGFromHex(color, 1);
        this.item1_id = undefined;
        this.item2_id = undefined;

        this.is_visible = true;
    }
    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;

        this.updatePixelLoc();
    }

    render() {
        this.context.beginPath();
        this.context.arc(this.pt_px.x, this.pt_px.y, this.r, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.core_color;

        this.context.fill();
        return undefined;
    }

    updateLocByPix(x, y) {
        this.pt_px = { x: x, y: y }
        this.updateCoorLoc();
    }

    updateLocByCoor(x, y) {
        this.backup();
        this.pt_c.x = x;
        this.pt_c.y = y;
        this.updatePixelLoc();
    }
    setVisible(visible){
        this.is_visible = visible;
    }

    updatePixelLoc() {
        this.pt_px = this.stage.getPixFromCoor(this.pt_c.x, this.pt_c.y);
    }

    updateCoorLoc() {
        this.pt_c = this.stage.getCoorFromPix(this.pt_px.x, this.pt_px.y);
    }

    name() {
        return "small point " + this.id;
    }
}
