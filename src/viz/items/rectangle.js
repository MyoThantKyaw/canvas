import { Funcs } from "../utils/Funcs";
import { Segment } from "./segment";

export class Rectangle {
    constructor(color = "#8f2490") {
        this.segments = [];
        this.temp_points = [];
        this.no_of_vertex = 3;
        this.is_visible = false;
        this.color = color;

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
        if (this.temp_points.length == 3) {
            var slope = this.segments[0].getSlope();
            slope = -1 / slope;
            var X = this.segments[0].point2.pt_c.x;
            var Y = this.segments[0].point2.pt_c.y;
            var c = (-slope * X) + Y;

            var pt_on_line = Funcs.projectToLine({ m: slope, c: c }, pt);
            pt.x = pt_on_line.x;
            pt.y = pt_on_line.y;
        }

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

            var vect_x = this.temp_points[0].x - this.temp_points[1].x;
            var vect_y = this.temp_points[0].y - this.temp_points[1].y;
            var x = this.temp_points[2].x + vect_x;
            var y = this.temp_points[2].y + vect_y;

            var segment = new Segment(this.temp_points[this.temp_points.length - 1], { x: x, y: y }, this.color);
            segment.setParent(this);

            var segment1 = new Segment({ x: x, y: y }, this.temp_points[0], this.color);
            segment1.setParent(this);

            this.segments.push(segment);
            this.layer.addItem(segment);
            this.segments.push(segment1);
            this.layer.addItem(segment1);

            this.segments[this.segments.length - 3].point2.addAttachedItem({ item: this.segments[this.segments.length - 2].point1, parent: undefined });
            this.segments[this.segments.length - 2].point1.addAttachedItem({ item: this.segments[this.segments.length - 3].point2, parent: undefined });

            this.segments[this.segments.length - 2].point2.addAttachedItem({ item: this.segments[this.segments.length - 1].point1, parent: undefined });
            this.segments[this.segments.length - 1].point1.addAttachedItem({ item: this.segments[this.segments.length - 2].point2, parent: undefined });

            this.segments[this.segments.length - 1].point2.addAttachedItem({ item: this.segments[0].point1, parent: undefined });
            this.segments[0].point1.addAttachedItem({ item: this.segments[this.segments.length - 1].point2, parent: undefined });
            this.is_visible = true;
        }
        segment.select();

        if (this.temp_points.length == 3) {
            for (var i = 0; i < 4; i++) {
                this.segments[i].point1.setMoveListener(this.getPreMoveHandler(i), this.getMovingHandler(i));
                this.segments[((i + 3) % 4)].point2.setMoveListener(this.getPreMoveHandler(i), this.getMovingHandler(i));
            }
        }
    }

    getArea(){
        return this.segments[0].getLength() * this.segments[1].getLength();
    }

    getCenterPoint(){
        return {x : ((this.segments[0].point1.pt_c.x - this.segments[2].point1.pt_c.x) / 2) + this.segments[2].point1.pt_c.x, y : ((this.segments[1].point1.pt_c.y - this.segments[3].point1.pt_c.y) / 2) + this.segments[3].point1.pt_c.y};    
    }

    render() {
        
        this.context.beginPath();
        this.context.lineWidth = .1;
        this.context.lineCap = 'round';
        this.context.strokeStyle = "transparent";

        this.context.moveTo(this.segments[0].point1.pt_px.x, this.segments[0].point1.pt_px.y);
        this.context.lineTo(this.segments[1].point1.pt_px.x, this.segments[1].point1.pt_px.y);
        this.context.lineTo(this.segments[2].point1.pt_px.x, this.segments[2].point1.pt_px.y);
        this.context.lineTo(this.segments[3].point1.pt_px.x, this.segments[3].point1.pt_px.y);
        this.context.lineTo(this.segments[0].point1.pt_px.x, this.segments[0].point1.pt_px.y);

        this.context.fillStyle = this.inner_color;
        this.context.fill();
    }

    getPreMoveHandler(index) {
        var point_adj = this.segments[(index + 2) % 4].point1;
        var point_left = this.segments[index].point2;
        var point_right = this.segments[(index + 3) % 4].point1;

        return (x, y) => {
            var d = Funcs.measureDistance({ x: x, y: y }, point_adj.pt_c);
            var g = Funcs.measureDistance({ x: x, y: y }, point_left.pt_c);
            var h = Funcs.measureDistance({ x: x, y: y }, point_right.pt_c);
            this.h_by_d = h / d;
            this.g_by_d = g / d;
            this.angle_to_rotate = Math.acos(g / d);
        }
    }

    getMovingHandler(index) {
        var point_adj = this.segments[(index + 2) % 4].point1;
        var point_left = this.segments[index].point2;
        var point_right = this.segments[(index + 3) % 4].point1;

        return (x, y) => {
            var d = Funcs.measureDistance({ x: x, y: y }, point_adj.pt_c);

            var d_x = point_adj.pt_c.x - x;
            var d_y = point_adj.pt_c.y - y;

            var g = Math.cos(this.angle_to_rotate) * d;
            var unit_vect = Funcs.getUnitVector({ x: (Math.cos(this.angle_to_rotate) * d_x) - (Math.sin(this.angle_to_rotate) * d_y), y: (Math.sin(this.angle_to_rotate) * d_x) + (Math.cos(this.angle_to_rotate) * d_y) })

            point_left.updateLocByCoor((unit_vect.x * g) + x, (unit_vect.y * g) + y);
            point_left.tryUpdate();

            point_right.updateLocByCoor(-(unit_vect.x * g) + point_adj.pt_c.x, -(unit_vect.y * g) + point_adj.pt_c.y);
            point_right.tryUpdate();
        }
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

    getPointIndex(point) {
        for (var i = 0; i < this.segments.length; i++) {
            if (this.segments[i].point1.id == point.id) {
                return i % 4;
            }
            else if (this.segments[i].point2.id == point.id) {
                return (i + 1) % 4;
            }
        }
        return NaN;
    }

    getArea() {
        return this.segments[0].getLength() * this.segments[1].getLength();
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
        this.context.lineTo(this.segments[3].point1.pt_px.x, this.segments[3].point1.pt_px.y);
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
        console.log("rectangle selected....");
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

    name() {
        return "rectangle  " + this.id;
    }
}
