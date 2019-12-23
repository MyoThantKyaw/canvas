import { Funcs } from "../utils/Funcs";

export class Angle {
    constructor(seg1, seg2) {
        this.angle = undefined;
        this.segment1 = seg1;
        this.segment2 = seg2;

        this.x = 0;
        this.y = 0;

        this.angle_seg1 = undefined;
        this.angle_seg2 = undefined;

        this.pt_origin = undefined;
        this.pt_start = undefined;
        this.pt_end = undefined;
        this.counter_clock_w = true;

        this.radius = 20; // in pixel..
        this.twoPi = 2 * Math.PI;
        this.label_loc_x = 0;
        this.label_loc_y = 0;
        this.factor = 360 / this.twoPi;

        this.selectPoints();
        
    }

    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;
        this.update();
    }

    update() {
        if(!Funcs.arePointsEqual(this.pt_origin.pt_c, this.pt_origin1.pt_c)){
            this.layer.removeAngleItem(this);
            return;
        }

        this.angle_seg1 = Math.atan2(this.pt_start.pt_c.y - this.pt_origin.pt_c.y, this.pt_start.pt_c.x - this.pt_origin.pt_c.x);
        this.angle_seg2 = Math.atan2(this.pt_end.pt_c.y - this.pt_origin.pt_c.y, this.pt_end.pt_c.x - this.pt_origin.pt_c.x);

        this.vect1 = Funcs.getUnitVector({ x: this.pt_start.pt_px.x - this.pt_origin.pt_px.x, y: this.pt_start.pt_px.y - this.pt_origin.pt_px.y })
        this.vect2 = Funcs.getUnitVector({ x: this.pt_end.pt_px.x - this.pt_origin.pt_px.x, y: this.pt_end.pt_px.y - this.pt_origin.pt_px.y })

        this.vect3 = { x: this.vect1.x + this.vect2.x, y: this.vect1.y + this.vect2.y }

        if (this.angle_seg1 < 0) {
            this.angle_seg1 = -this.angle_seg1;
        }
        else if (this.angle_seg1 < Math.PI) {
            this.angle_seg1 = this.twoPi - this.angle_seg1;
        }

        if (this.angle_seg2 < 0) {
            this.angle_seg2 = -this.angle_seg2;
        }
        else if (this.angle_seg2 < Math.PI) {
            this.angle_seg2 = this.twoPi - this.angle_seg2;
        }

        this.x = this.pt_origin.pt_px.x;
        this.y = this.pt_origin.pt_px.y;

        if (this.angle_seg1 < this.angle_seg2) {
            var ang = this.angle_seg2 + ((this.twoPi - this.angle_seg2 + this.angle_seg1) / 2);
            this.diff = this.twoPi + this.angle_seg1 - this.angle_seg2;
        }
        else {
            var ang = this.angle_seg2 + ((this.angle_seg1 - this.angle_seg2) / 2);
            this.diff = this.angle_seg1 - this.angle_seg2;
        }

        this.label_loc_x = Math.sqrt(((this.radius + 15) ** 2) / (2 + (Math.tan(ang) ** 2)))

        var ang_test = ang % this.twoPi;
        if (ang_test > (Math.PI / 2) && ang_test < (3 * Math.PI / 2)) {
            this.label_loc_x = -this.label_loc_x;
        }

        this.label_loc_y = this.label_loc_x * Math.tan(ang);
        this.angle = parseFloat((this.diff * this.factor).toFixed(4));
    }

    selectPoints() {
        if (Funcs.arePointsEqual(this.segment1.point1.pt_c, this.segment2.point1.pt_c)) {
            this.pt_origin = this.segment1.point1;
            this.pt_origin1 = this.segment2.point1;
            this.pt_start = this.segment1.point2;
            this.pt_end = this.segment2.point2;
        }
        else if (Funcs.arePointsEqual(this.segment1.point1.pt_c, this.segment2.point2.pt_c)) {
            this.pt_origin = this.segment1.point1;
            this.pt_origin1 = this.segment2.point2;
            this.pt_start = this.segment1.point2;
            this.pt_end = this.segment2.point1;
        }
        else if (Funcs.arePointsEqual(this.segment1.point2.pt_c, this.segment2.point1.pt_c)) {
            this.pt_origin = this.segment1.point2;
            this.pt_origin1 = this.segment2.point1;
            this.pt_start = this.segment1.point1;
            this.pt_end = this.segment2.point2;
        }
        else if (Funcs.arePointsEqual(this.segment1.point2.pt_c, this.segment2.point2.pt_c)) {
            this.pt_origin = this.segment1.point2;
            this.pt_origin1 = this.segment2.point2;
            this.pt_start = this.segment1.point1;
            this.pt_end = this.segment2.point1;
        }
        else {
            console.error("Segments are not attached..")
        }
    }

    render() {
        this.context.beginPath();

        this.context.lineWidth = 1.4;
        this.context.strokeStyle = "#5d5d5d";
        this.context.setLineDash([2.5])
        if (this.angle == 90) {
            this.context.moveTo((this.vect1.x * 20) + this.pt_origin.pt_px.x, (this.vect1.y * 20) + this.pt_origin.pt_px.y);
            this.context.lineTo((this.vect3.x * 20) + this.pt_origin.pt_px.x, (this.vect3.y * 20) + this.pt_origin.pt_px.y);
            this.context.lineTo((this.vect2.x * 20) + this.pt_origin.pt_px.x, (this.vect2.y * 20) + this.pt_origin.pt_px.y);
        }
        else {
            this.context.arc(this.x, this.y, this.radius, this.angle_seg1, this.angle_seg2, this.counter_clock_w);
        }

        this.context.stroke();
        this.context.fillStyle = "black";
        this.context.font = "10pt Calibri";
        this.context.fillText(this.angle, this.x + this.label_loc_x, this.y + this.label_loc_y);
        this.context.setLineDash([])
    }

    name() {
        return "angle " + this.id;
    }

   
}