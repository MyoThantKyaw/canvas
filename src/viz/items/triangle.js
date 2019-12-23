import { Funcs } from "../utils/Funcs";
import { Segment } from "./segment";

export class Triangle {
    constructor(color = "#4f2020") {
        this.segments = [];
        this.temp_points = [];
        this.no_of_vertex = 3;
        this.is_visible = false;
        this.color = color;

        this.toSetup_movable = false;
        this.inner_color = Funcs.getRBGFromHex(color, 0.1);
    }

    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;

        if (this.toSetup_movable) {
            this.setupForMovable();
        }
    }

    addVertex(pt) { // in coordinate
        if (this.temp_points.length == this.no_of_vertex) {
            return;
        }
        this.temp_points.push(pt);

        if (this.temp_points.length == 1) {
            var segment = new Segment(pt, pt, this.color);
            segment.setParent(this);

            this.segments.push(segment);
            this.layer.addItem(segment);
        }
        else if (this.temp_points.length < this.no_of_vertex) {

            this.segments[this.segments.length - 1].updateLocByCoor(this.temp_points[this.temp_points.length - 2], this.temp_points[this.temp_points.length - 1]);
            var segment = new Segment(this.temp_points[this.temp_points.length - 1], this.temp_points[this.temp_points.length - 1], this.color);
            segment.setParent(this);

            this.segments.push(segment);
            this.layer.addItem(segment)

            this.segments[this.segments.length - 2].point2.addAttachedItem({ item: this.segments[this.segments.length - 1].point1, parent: undefined });
            this.segments[this.segments.length - 1].point1.addAttachedItem({ item: this.segments[this.segments.length - 2].point2, parent: undefined });
        }
        else if (this.temp_points.length == this.no_of_vertex) {
            this.segments[this.segments.length - 1].updateLocByCoor(this.temp_points[this.temp_points.length - 2], this.temp_points[this.temp_points.length - 1])

            var segment = new Segment(this.temp_points[this.temp_points.length - 1], this.temp_points[0], this.color);
            segment.setParent(this);

            this.segments.push(segment);
            this.layer.addItem(segment)

            this.segments[this.segments.length - 2].point2.addAttachedItem({ item: this.segments[this.segments.length - 1].point1, parent: undefined });
            this.segments[this.segments.length - 1].point1.addAttachedItem({ item: this.segments[this.segments.length - 2].point2, parent: undefined });

            this.segments[this.segments.length - 1].point2.addAttachedItem({ item: this.segments[0].point1, parent: undefined });
            this.segments[0].point1.addAttachedItem({ item: this.segments[this.segments.length - 1].point2, parent: undefined });
            this.is_visible = true;
        }
        segment.select();
    }

    render() {
        this.context.beginPath();
        this.context.lineWidth = .1;
        this.context.lineCap = 'round';
        this.context.strokeStyle = "transparent";

        this.context.moveTo(this.segments[0].point1.pt_px.x, this.segments[0].point1.pt_px.y);
        this.context.lineTo(this.segments[1].point1.pt_px.x, this.segments[1].point1.pt_px.y);

        this.context.lineTo(this.segments[2].point1.pt_px.x, this.segments[2].point1.pt_px.y);
        this.context.lineTo(this.segments[0].point1.pt_px.x, this.segments[0].point1.pt_px.y);

        this.context.fillStyle = this.inner_color;
        this.context.fill();
    }

    setupForMovable() {
        this.stage.addMouseDownListener(this,
            (pt_coor) => { // (x, y) in coordinate
                this.diff_from_pts_x = [];
                this.diff_from_pts_y = [];
                for (var i = 0; i < this.segments.length; i++) {
                    this.diff_from_pts_x.push(this.segments[i].point1.pt_c.x - pt_coor.x);
                    this.diff_from_pts_y.push(this.segments[i].point1.pt_c.y - pt_coor.y);
                }
                this.layer.moveItemToTop(this)    
            },
            (pt_coor) => { //(x, y) in coordinate
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i].point1.updateLocByCoor(pt_coor.x + this.diff_from_pts_x[i] , pt_coor.y + this.diff_from_pts_y[i])
                    this.segments[i].point1.tryUpdate();
                }
                this.layer.render();
            }
        )
    }

    getArea(){
        return Math.abs(0.5 * (((this.segments[1].point1.pt_c.x - this.segments[0].point1.pt_c.x) * (this.segments[2].point1.pt_c.y - this.segments[0].point1.pt_c.y)) - ((this.segments[2].point1.pt_c.x - this.segments[0].point1.pt_c.x) * (this.segments[1].point1.pt_c.y - this.segments[0].point1.pt_c.y))))
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

    isInPath(x, y) {
        this.context.beginPath();
        this.context.moveTo(this.segments[0].point1.pt_px.x, this.segments[0].point1.pt_px.y);
        this.context.lineTo(this.segments[1].point1.pt_px.x, this.segments[1].point1.pt_px.y);
        this.context.lineTo(this.segments[2].point1.pt_px.x, this.segments[2].point1.pt_px.y);
        this.context.lineTo(this.segments[0].point1.pt_px.x, this.segments[0].point1.pt_px.y);

        var isInPath = this.context.isPointInPath(x * this.stage.devicePixelRatio, y * this.stage.devicePixelRatio);

        if (isInPath) {
            return { dist: 0, id: this.id };
        }
        else {
            return { dist: 9999999, id: this.id };
        }
    }

    select() {
        this.is_selected = true;
        console.log("triangle selected..")
    }

    unselect() {
        this.is_selected = false;

    }

    backupData() {

    }


    restoreData() {

    }

    isSibling(child) {
        if (child.constructor.name == "Point") {
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i].point1.id == child.id || this.segments[i].point2.id == child.id) {
                    return true;
                }
            }
        }
        else if (child.constructor.name == "Segment") {
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i].id == child.id) {
                    return true;
                }
            }
        }

        return false;
    }

    isAttachedTo(item) {
        return false;
    }


    isParentOfAttachedItem(parent) {
        return false;
    }

    isParent(item) {
        return false;
    }

    tryUpdate(requesting_item) {
        return true;
    }

    updatePixelValues() {

    }

    getCenterPoint(){
        var x_s = 0;
        var y_s = 0;
        for(var i = 0; i < 3; i++){
            x_s += this.segments[i].point1.pt_c.x;
            y_s += this.segments[i].point1.pt_c.y; 
        }
        x_s /= 3;
        y_s /= 3;

        return {x : x_s, y : y_s}
    }

    name() {
        return "triangle  " + this.id;
    }
}
