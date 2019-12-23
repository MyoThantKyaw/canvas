import { Funcs } from "../utils/Funcs.js"
import { Point } from "./point.js";

export class Circle {
    constructor(center, radius, color = "#110ff0") {
        this.center_c = center;
        this.radius_c = radius;

        this.color_hex = color;
        this.color = Funcs.getRBGFromHex(color, 0.1);
        this.current_color = this.color;
        this.lineWidth = 2;
        this.is_selected = false;
        this.selection_color = Funcs.getRBGFromHex(color, 1);

        this.id = undefined;
        this.current_index = -1;
        this.toSetup_movable = false;
        this.is_visible = false;
        this.is_movable = false;

        this.fixed_constraint = false;

        this.attached_segment_info = undefined;
        this.attached_points_info = [];

        if (this.center_c != undefined && this.radius_c != undefined) {
            this.is_visible = true;
        }
    }

    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;

        if(this.is_visible){
            this.updatePixelValues()
        }
        

        if (this.toSetup_movable) {
            this.setupForMovable();
        }

        if (this.center_c != undefined) {
            this.center = new Point(this.center_c.x, this.center_c.y, 3, this.color_hex);
            this.center.setParent(this)

            this.layer.addItem(this.center);
        }
    }

    render() {
        this.context.beginPath()
        this.context.arc(this.center_px.x, this.center_px.y, this.radius_px, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.fill();
        this.context.lineWidth = this.lineWidth;
        this.context.strokeStyle = this.selection_color;
        this.context.stroke();
    }

    // in coordinate
    setRadius(radius_c) {
        this.radius_c = radius_c;
        if (this.center_c != undefined && this.radius_c != undefined) {
            this.is_visible = true;
            
            this.updatePixelValues()
            
        }
    }

    setCenter(center_c) {
        this.center_c = center_c;
        if (this.center_c != undefined && this.radius_c != undefined) {
            this.is_visible = true;
            this.updatePixelValues()
        }

        this.center = new Point(this.center_c.x, this.center_c.y, 3, this.color_hex);
        this.center.setParent(this)

        this.layer.addItem(this.center);
    }

    tryUpdate(requesting_item) {
        if (requesting_item != undefined) {

        }
        else {
            for (var i = 0; i < this.attached_points_info.length; i++) {
                this.attached_points_info[i].item.tryUpdate(this);
            }

            for (var i = 0; i < this.center.attached_points_info.length; i++) {
                this.center.attached_points_info[i].item.tryUpdate(this.center);
            }

            if (this.center.attached_segment_info != undefined) {
                this.center.attached_segment_info.item.tryUpdate(this.center);
            }
        }
        return true;
    }

    setupForMovable() {
        this.stage.addMouseDownListener(this,
            (pt_coor) => { // (x, y) in coordinate
                var pt_px = this.stage.getPixFromCoor(pt_coor.x, pt_coor.y);
                var diff = Funcs.measureDistance(this.center_px, pt_px);
                if (Math.abs(diff - this.radius_px) < 10) {
                    var info = this.pointToShap(pt_px.x, pt_px.y);
                    var snap_pt_coor = this.stage.getCoorFromPix(info.x, info.y);

                    this.change_radius = true;
                    this.diff_mx_coor_x = snap_pt_coor.x - pt_coor.x;
                    this.diff_my_coor_y = snap_pt_coor.y - pt_coor.y;
                }
                else {
                    this.change_radius = false;
                    this.diff_mx_coor_x = this.center_c.x - pt_coor.x;
                    this.diff_my_coor_y = this.center_c.y - pt_coor.y;
                }
            },
            (pt_coor) => { //(x, y) in coordinate
                if (this.fixed_constraint) {
                    return;
                }
                var new_x = pt_coor.x + this.diff_mx_coor_x;
                var new_y = pt_coor.y + this.diff_my_coor_y;

                this.backup();

                if (this.change_radius) {
                    // if there is 
                    var new_radius = Funcs.measureDistance(this.center_c, { x: new_x, y: new_y });

                    this.radius_c = new_radius;
                    this.updatePixelValues()
                    this.tryUpdate();
                }
                else {

                    if (this.center.attached_segment_info != undefined) {
                        var seg = this.center.attached_segment_info.item;
                        if (seg.point1.attached_circle_info != undefined && seg.point2.attached_circle_info != undefined) {
                            if (seg.point1.attached_circle_info.item.id == this.id && seg.point2.attached_circle_info.item.id) {

                            }
                            else {
                                return;
                            }
                        }
                        else {
                            return;
                        }
                    }

                    this.n_item_info = this.layer.findPointToSnap(this.stage.getPixFromCoor(new_x, new_y), this.center);

                    if (this.n_item_info != undefined && this.n_item_info.x != NaN && this.n_item_info.dist < 5) {
                        // snap
                        var item_to_snap = this.n_item_info.item;
                        var pt = this.stage.getCoorFromPix(this.n_item_info.x, this.n_item_info.y)

                        if (!this.isAttachedTo(this.n_item_info.item)) {
                            new_x = pt.x;
                            new_y = pt.y;

                            this.center.snapped_item = item_to_snap;
                        }
                    }
                    else { // unsnap
                        // remove from attached items..
                        this.center.snapped_item = undefined;
                    }

                    this.center_c.x = new_x;
                    this.center_c.y = new_y;

                    this.center.updateLocByCoor(new_x, new_y);
                    this.center.tryUpdate();
                    this.updatePixelValues();
                    this.tryUpdate();
                }
                // whenever "layer.render()" called, layer.updateSmallPoints() must be called first.
                this.layer.updateSmallPoints(this);
                this.layer.render();
            }
        )
    }

    backup() {

    }

    updatePixelValues() {
        this.center_px = this.stage.getPixFromCoor(this.center_c.x, this.center_c.y);
        this.radius_px = this.stage.getPixLengthFromCoor(this.radius_c);
    }

    isAttachedTo(item) {
        return false;
    }

    isParent(item) {
        return false;
    }

    isParentOfAttachedItem(parent) {
        return false;
    }

    setMovable(callback) {
        if (this.stage != undefined) {
            this.setupForMovable();
            this.is_movable = true;
        }
        else {
            this.toSetup_movable = true;
        }
        this.move_callback = callback;
    }

    pointToShap(x, y, item) {
        var pt_coor = this.stage.getCoorFromPix(x, y);
        var theta = Math.atan2(pt_coor.y - this.center_c.y, pt_coor.x - this.center_c.x);

        var near_x = this.radius_c / Math.sqrt(1 + (Math.tan(theta) ** 2));
        var near_y = Math.tan(theta) * near_x;

        if (Math.abs(theta) > (Math.PI / 2)) {
            near_x = -near_x
            near_y = -near_y
        }

        var pt_px = this.stage.getPixFromCoor(this.center_c.x + near_x, this.center_c.y + near_y);
        return { dist: Funcs.measureDistance(pt_px, { x: x, y: y }), x: pt_px.x, y: pt_px.y, id: this.id, item: this }
    }

    addAttachedItem(info) {
        if (info.item.constructor.name == "Point") {
            this.attached_points_info.push(info);
        }
    }

    // radius in coordinate
    changeRadius(radius) {
        this.radius_px = radius;
        this.radius_px = this.stage.getPixLengthFromCoor(radius);
    }

    isInPath(x, y) {
        if (Funcs.measureDistance({ x: x, y: y }, this.center_px) < this.radius_px + 8) {
            return { dist: 0, id: this.id };
        }
        else {
            return { dist: 9999999, id: this.id };
        }
    }

    select() {
        this.is_selected = true;
        this.center.use_larger_pt = true;
        this.current_color = this.selection_color;
        this.lineWidth = 3.5;
    }

    unselect() {
        //  console.log("unselect")
        this.center.use_larger_pt = false;
        this.is_selected = false;
        this.current_color = this.color;
        this.lineWidth = 2;
    }

    backupData() {

    }

    restoreData() {

    }

    isSibling(child) {
        return false;
    }

    name() {
        return "circle  " + this.id;
    }

    // angle in pi, -pi form
    // return point in coordinate
    getPointFromAngle(angle) {
        var near_x = this.radius_c / Math.sqrt(1 + (Math.tan(angle) ** 2));
        var near_y = Math.tan(angle) * near_x;

        if (Math.abs(angle) > (Math.PI / 2)) {
            near_x = -near_x
            near_y = -near_y
        }

        return { x: this.center_c.x + near_x, y: this.center_c.y + near_y };
    }

    getAngleOfPoint(pt) { // pt in coordinate.....
        return Math.atan2(pt.y - this.center_c.y, pt.x - this.center_c.x);
    }

    getArea() { // returns in coordinate
        return Math.PI * (this.radius_c ** 2);
    }

    getIntersectionPtsWithSeg(segment) {
        var line_eq = segment.getLineFormula();
        var m = line_eq.m;
        var c = line_eq.c;
        var cx = this.center_c.x;
        var cy = this.center_c.y;

        var a = 1 + (m ** 2)
        var b = (-2 * cx) + (2 * m * c) - (2 * m * cy)
        var c = (cx ** 2) + (c ** 2) - (2 * c * cy) + (cy ** 2) - (this.radius_c ** 2);

        var x1 = (-b + Math.sqrt((b ** 2) - (4 * a * c))) / (2 * a)
        var x2 = (-b - Math.sqrt((b ** 2) - (4 * a * c))) / (2 * a)

        var y1 = (line_eq.m * x1) + line_eq.c;
        var y2 = (line_eq.m * x2) + line_eq.c;

        var pt1 = { x: x1, y: y1 }
        if (!segment.isInBox(pt1)) {
            pt1 = { x: NaN, y: NaN }
        }
        var pt2 = { x: x2, y: y2 }
        if (!segment.isInBox(pt2)) {
            pt2 = { x: NaN, y: NaN }
        }

        return [pt1, pt2];
    }

    getCenterPoint() {
        return this.center_c;
    }

    getIntersectionPoints(item) {
        if (item.constructor.name == "Segment") {
            return this.getIntersectionPtsWithSeg(item);
        }
        // this formula is from https://math.stackexchange.com/questions/256100/how-can-i-find-the-points-at-which-two-circles-intersect
        else if (item.constructor.name == "Circle") {

            var x1 = this.center_c.x;
            var y1 = this.center_c.y;
            var x2 = item.center_c.x;
            var y2 = item.center_c.y;
            var r1 = this.radius_c;
            var r2 = item.radius_c;

            var d = Math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2));
            var l = ((r1 ** 2) - (r2 ** 2) + (d ** 2)) / (2 * d);
            var h = Math.sqrt((r1 ** 2) - (l ** 2))

            var inter_x1 = ((l / d) * (x2 - x1)) + ((h / d) * (y2 - y1)) + x1;
            var inter_x2 = ((l / d) * (x2 - x1)) - ((h / d) * (y2 - y1)) + x1;

            var inter_y1 = ((l / d) * (y2 - y1)) - ((h / d) * (x2 - x1)) + y1;
            var inter_y2 = ((l / d) * (y2 - y1)) + ((h / d) * (x2 - x1)) + y1;

            return [{ x: inter_x1, y: inter_y1 }, { x: inter_x2, y: inter_y2 }];
        }
        return undefined;
    }
}