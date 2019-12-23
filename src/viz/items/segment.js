import { Funcs } from "../utils/Funcs.js"
import { EasingFunctions } from "../utils/easing.js"
import { Point } from "./point.js";

export class Segment {
    constructor(start_pt, end_pt, color = "#110ff0", lineWidth = 2, use_ctrl_pts = true) {

        this.start_pt = start_pt;
        this.end_pt = end_pt;
        this.colorHex = color;

        this.parent_item = undefined;

        this.color = Funcs.getRBGFromHex(color, 0.75);
        this.current_color = this.color;
        this.tolerance = 10; // in pixel
        this.lineWidth = lineWidth;
        this.is_selected = false;
        this.selection_color = Funcs.getRBGFromHex(color, 1);
        this.selection_callback = undefined;
        this.unselection_callback = undefined;
        this.show_control_pts = use_ctrl_pts;

        this.id = undefined;
        this.current_index = -1;
        this.toSetup_movable = false;
        this.is_visible = false;

        this.change_callback = undefined;
        this.rotate_callback = undefined;

        // constraints..
        this.fixed_constraint = false;
        this.length_constraint = undefined; // set length of segment in coordinate
        this.point1_fixed_constraint = undefined;
        this.point2_fixed_constraint = undefined;
        this.parallel_constraint = [] // list of segments that parallel with this segment
        this.length_equal_constraint = [] // list of segments that equal-length with this segment
        this.horizontal_constraint = false;
        this.vertical_constraint = false;

        this.attached_items = [];

        this.point1_snap = undefined;
        this.point2_snap = undefined;
        this.attached_points_info = [];

    }

    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;

        if (this.toSetup_movable) {
            this.setupForMovable();
        }

        if (this.show_control_pts && (this.start_pt != undefined && this.end_pt != undefined)) {
            this.point1 = new Point(this.start_pt.x, this.start_pt.y, 3, this.colorHex);
            this.point2 = new Point(this.end_pt.x, this.end_pt.y, 3, this.colorHex);

            this.point1.setParent(this)
            this.point2.setParent(this)
            this.point1.setVisible(false);
            this.point2.setVisible(false);

            this.point1.setMovable((x, y) => {
                this.updatePixelLoc();
            });

            this.point2.setMovable((x, y) => {
                this.updatePixelLoc();
            });

            this.layer.addItem(this.point1)
            this.layer.addItem(this.point2)

            this.is_visible = true;
        }
        this.updatePixelLoc();
    }

    addPoint(pt){ // in coordinate
        if(this.point1 == undefined){
            this.point1 = new Point(pt.x, pt.y, 3, this.colorHex);
            this.point1.setParent(this)
            this.point1.setMovable((x, y) => {
                this.updatePixelLoc();
            });
            this.layer.addItem(this.point1)
        }
        else if(this.point2 == undefined){
            this.point2 = new Point(pt.x, pt.y, 3, this.colorHex);
            this.point2.setParent(this)
            this.point2.setMovable((x, y) => {
                this.updatePixelLoc();
            });

            this.layer.addItem(this.point2);
            this.is_visible = true;
        }
    }

    select() {
        this.is_selected = true;

        if (this.show_control_pts) {
            this.point1.setVisible(true);
            this.point2.setVisible(true);
        }

        this.current_color = this.selection_color;
        this.lineWidth = 3.5;
    }

    unselect() {
        this.is_selected = false;
        if (this.show_control_pts) {
            this.point1.setVisible(false);
            this.point2.setVisible(false);
        }

        this.current_color = this.color;
        this.lineWidth = 2;
    }

    render(check = false, x = 0, y = 0) {
        this.context.beginPath();
        this.context.lineWidth = this.lineWidth;
        this.context.strokeStyle = this.current_color;
        this.context.lineCap = 'round';

        this.context.moveTo(this.point1.pt_px.x, this.point1.pt_px.y)
        this.context.lineTo(this.point2.pt_px.x, this.point2.pt_px.y)

        if (check) {
            return this.isInPath(x, y);
        }

        this.context.stroke();
        return undefined;
    }

    setRotateCallback(callback) {
        this.rotate_callback = callback;
    }

    setupForMovable() {
        this.stage.addMouseDownListener(this,
            (pt_coor) => {
                this.diff_mousex_startc_x = pt_coor.x - this.point1.pt_c.x;
                this.diff_mousex_startc_y = pt_coor.y - this.point1.pt_c.y;

                this.diff_mousex_endc_x = pt_coor.x - this.point2.pt_c.x;
                this.diff_mousex_endc_y = pt_coor.y - this.point2.pt_c.y;

                this.layer.moveItemToTop(this)
            },
            (pt_coor) => {

                if (this.isAttachedToCircleCenter()) return;

                var pt1_att_seg = this.point1.attached_segment_info != undefined
                var pt2_att_seg = this.point2.attached_segment_info != undefined
                if (pt1_att_seg && pt2_att_seg) {
                    var formula = this.getLineFormula();
                    var new_c = (pt_coor.y - (formula.m * pt_coor.x + formula.c)) + formula.c;

                    var pt1 = Funcs.getInterPtOfTwoLines(this.point1.attached_segment_info.item.getLineFormula(), { m: formula.m, c: new_c });
                    var pt2 = Funcs.getInterPtOfTwoLines(this.point2.attached_segment_info.item.getLineFormula(), { m: formula.m, c: new_c });

                    if (this.point1.attached_segment_info.item.isOnSegment(pt1) && this.point2.attached_segment_info.item.isOnSegment(pt2)) {

                        this.tryUpdate();
                    }
                    else if (this.attached_points_info.length == 1) {

                    }
                    this.layer.render();
                }

                else if (!((!pt1_att_seg && pt2_att_seg) || (pt1_att_seg && !pt2_att_seg))) {

                    this.point1.updateLocByCoor(pt_coor.x - this.diff_mousex_startc_x, pt_coor.y - this.diff_mousex_startc_y)
                    this.point2.updateLocByCoor(pt_coor.x - this.diff_mousex_endc_x, pt_coor.y - this.diff_mousex_endc_y)

                    if (this.change_callback != undefined) {
                        this.change_callback();
                    }
                    this.tryUpdate();
                    this.layer.render();
                }
            });
    }

    isAttachedToCircleCenter() {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.parent != undefined && this.attached_points_info[i].item.parent.constructor.name == "Circle") {
                return true;
            }
        }
        return false;
    }

    projectToSegment(pt) {
        var eq = this.getLineFormula();
        var c_of_point = pt.y + ((1 / eq.m) * pt.x)

        var proj_x = (c_of_point - eq.c) / (eq.m + (1 / eq.m));
        var proj_y = (eq.m * proj_x) + eq.c;

        var pt_on_line = {};
        pt_on_line.x = proj_x;
        pt_on_line.y = proj_y;
        return pt_on_line;
    }

    getAttachedCircleCenters() {
        var center_pts = [];
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.parent.constructor.name == "Circle") {
                center_pts.push(this.attached_points_info[i]);
            }
        }
        return center_pts;
    }

    tryUpdate(requesting_item) {
        //  this.backup();

        if (requesting_item == undefined) {
            // requested by self...
            if (this.show_control_pts) {
                this.point1.tryUpdate(this);
                this.point2.tryUpdate(this);
            }

            for (var i = 0; i < this.attached_points_info.length; i++) {
                if (this.attached_points_info[i].item.parent != undefined && this.attached_points_info[i].item.parent.constructor.name == "Circle") {
                    console.log("continue...")
                    continue;
                }
                var ret = this.attached_points_info[i].item.tryUpdate(this);

                if (!ret) {
                    this.restore_self();
                    for (var j = i - 1; j >= 0; j--) {
                        this.attached_points_info[j].item.restore();
                    }
                    return false; // or break;
                }
            }
        }
        else {
            // request by childs..
            if (this.parent != undefined && requesting_item.id == this.parent.id) {
                /// request by parent
            }
            else if (requesting_item.constructor.name == "Point") {
                //   console.log("request by point....")
            }
        }
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.id == requesting_item.id) { continue; }
            if (this.attached_points_info[i].item.parent != undefined && this.attached_points_info[i].item.parent.constructor.name == "Circle") { continue }
            var ret = this.attached_points_info[i].item.tryUpdate(this);
        }
        return true;
    }

    notifyToUpdate(requesting_item) {
        var is_ok = true;

        for (var i = 0; i < this.attached_items.length; i++) {
            if (this.attached_items[i].item.id == requesting_item.id) continue;
            var ret = this.attached_items[i].item.notifyToUpdate(this);
            if (!ret) {
                is_ok = false;
            }
        }

        return is_ok;

        // update parent...
        // return whether it is ok to change..
    }

    updateBody() {
        this.start_pt_coor = this.point1.pt_c;
        this.end_pt_coor = this.point2.pt_c;
    }

    segmentUpdate() {
        this.start_pt_coor = this.point1.pt_c
        this.end_pt_coor = this.point2.pt_c
        this.updatePixelLoc();
        return true;
    }

    findAttachedInfo(item) {
        for (var i = 0; i < this.attached_items.length; i++) {
            if (this.attached_items[i].item === item) {
                return this.attached_items[i];
            }
        }
        return undefined;
    }

    addAttachedItem(info) {
        this.attached_points_info.push(info)
    }

    isAttachedTo(item) {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.id == item.id) {
                return true;
            }
        }
        return false;
    }

    hasOneAndOnlyAttachedPt() {
        if (this.attached_points_info.length == 1) {
            return this.attached_points_info[0];
        }
        return undefined;
    }

    isParentOfAttachedItem(parent) {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.parent != undefined && this.attached_points_info[i].item.parent.id == parent.id) {
                return true;
            }
        }
        return false;
    }

    // called from child points
    pointSnapped(point, info) {
        if (this.point1.id == point.id) {
            this.point1_snap = info;
        }
        else {
            this.point2_snap = info;
        }
        info.parent.addDepandentItem(this);
    }

    pointUnSnapped(point) {
        if (this.point1.id == point.id) {
            this.point1_snap = undefined;
        }
        else {
            this.point2_snap = undefined;
        }
    }

    setMovable(callback) {
        if (this.stage != undefined) {
            this.setupForMovable();
        }
        else {
            this.toSetup_movable = true;
        }
        this.change_callback = callback;
    }

    updateStartLocByCoor(start_coor) {
        this.start_pt_coor = start_coor;

        this.updatePixelLoc();
    }

    updateLocByPix(start_px, end_px) {
        this.point1.pt_px = start_px;
        this.point2.pt_px = end_px;

        this.updateCoorLoc();
    }

    updateEndLocByCoor(end_coor) {
        this.end_pt_coor = end_coor;
        this.updatePixelLoc();
    }

    updateLocByCoor(start_coor, end_coor) {
        this.point1.updateLocByCoor(start_coor.x, start_coor.y)
        this.point2.updateLocByCoor(end_coor.x, end_coor.y)
    }

    updatePixelLoc() {
        // this.point1.pt_px = this.stage.getPixFromCoor(this.start_pt_coor.x, this.start_pt_coor.y);
        // this.point2.pt_px = this.stage.getPixFromCoor(this.end_pt_coor.x, this.end_pt_coor.y);
    }

    updateAll(pt1, pt2) {
        // this.start_pt_coor = pt1,
        //     this.end_pt_coor = pt2;
        // this.point1.pt_px = this.stage.getPixFromCoor(pt1.x, pt1.y);
        // this.point2.pt_px = this.stage.getPixFromCoor(pt2.x, pt2.y);

        if (this.show_control_pts) {
            this.point1.updateLocByCoor(pt1.x, pt1.y)
            this.point2.updateLocByCoor(pt2.x, pt2.y)
        }
    }

    updateCoorLoc() {
        this.start_pt_coor = this.stage.getCoorFromPix(this.point1.pt_px.x, this.point1.pt_px.y)
        this.end_pt_coor = this.stage.getCoorFromPix(this.point2.pt_px.x, this.point2.pt_px.y);

        if (this.show_control_pts) {
            this.point1.updateLocByPix(this.point1.pt_px.x, this.point1.pt_px.y)
            this.point2.updateLocByPix(this.point2.pt_px.x, this.point2.pt_px.y)
        }
    }

    listenSelection(callback) {
        console.log("selected segment..")
    }

    listenUnselection(callback) {
        console.log("un-selected segment..")
    }

    isInPath(x, y) {
        return this.pointToShap(x, y);
    }

    makeHorizontalOrVertical(is_horizontal = true) {
        this.midPoint = Funcs.getMidPoint(this.start_pt_coor, this.end_pt_coor);

        var start_from_mid_pt = { x: (this.start_pt_coor.x - this.midPoint.x), y: (this.start_pt_coor.y - this.midPoint.y) }
        if (start_from_mid_pt.y >= 0) {
            this.initial_angle = Math.atan2(start_from_mid_pt.y, start_from_mid_pt.x);
        }
        else {
            this.initial_angle = (2 * Math.PI) + Math.atan2(start_from_mid_pt.y, start_from_mid_pt.x);
        }

        this.dist_half = Funcs.measureDistance(this.start_pt_coor, this.midPoint);

        if (is_horizontal) {
            if (this.initial_angle <= (Math.PI / 2)) {
                this.end_angle = 0;
            }
            else if (this.initial_angle > (3 * Math.PI / 2)) {
                this.end_angle = 2 * Math.PI;
            }
            else {
                this.end_angle = Math.PI;
            }
        }
        else {
            if (this.initial_angle <= Math.PI) {
                this.end_angle = Math.PI / 2;
            }
            else {
                this.end_angle = 3 * Math.PI / 2;
            }
        }

        this.time_taken = 500;
        this.num = 0;
        this.last_time_mili = Date.now();

        if (this.parent_item != undefined) {
            this.parent_item.handlePreMakeHorizontal(this);
        }
        this.animateMakeHorizontal();
        if (is_horizontal) {
            this.horizontal_constraint = true;
            this.point1.horizontal_constraint = true;
            this.point2.horizontal_constraint = true;
        } else {
            this.vertical_constraint = true;
        }
    }

    animateMakeHorizontal() {
        this.animation_id = requestAnimationFrame(() => this.animateMakeHorizontal())
        this.now = Date.now();
        this.num += (this.now - this.last_time_mili) / this.time_taken;

        if (this.num > 1) { this.num = 1; }

        this.num_eased = EasingFunctions.easeOutQuart(this.num);
        var angle = (this.initial_angle * (1 - this.num_eased)) + (this.end_angle * this.num_eased)

        if (this.parent_item != undefined) {
            this.parent_item.handleMakeHorizontal(-(this.initial_angle - angle));
        }
        else {
            var start_x = this.dist_half * Math.cos(angle)
            var start_y = this.dist_half * Math.sin(angle)

            this.start_pt_coor.x = this.midPoint.x + start_x;
            this.start_pt_coor.y = this.midPoint.y + start_y;

            this.end_pt_coor.x = this.midPoint.x - start_x;
            this.end_pt_coor.y = this.midPoint.y - start_y;

            this.updatePixelLoc();

            if (this.show_control_pts) {
                this.point1.updateLocByCoor(this.start_pt_coor.x, this.start_pt_coor.y);
                this.point2.updateLocByCoor(this.end_pt_coor.x, this.end_pt_coor.y);
            }
        }

        if (this.num == 1) {
            cancelAnimationFrame(this.animation_id);
            if (this.post_rotate_callback != undefined) {
                this.post_rotate_callback();
            }

            if (Math.abs(this.start_pt_coor.x - this.end_pt_coor.x) < 0.00000000000001) {
                var roundedValue = parseFloat(this.start_pt_coor.x.toFixed(15));
                this.start_pt_coor.x = roundedValue;
                this.end_pt_coor.x = roundedValue;
                this.updatePixelLoc();
            }
            else if (Math.abs(this.start_pt_coor.y - this.end_pt_coor.y) < 0.00000000000001) {
                var roundedValue = parseFloat(this.start_pt_coor.y.toFixed(15));
                this.start_pt_coor.y = roundedValue;
                this.end_pt_coor.y = roundedValue;
                this.updatePixelLoc();
            }
        }

        this.layer.render();
        this.last_time_mili = this.now;
    }

    backup() {
        if (this.show_control_pts) {
            this.backup_point1_pt_coor = {}
            this.backup_point1_pt_coor.x = this.point1.pt_c.x;
            this.backup_point1_pt_coor.y = this.point1.pt_c.y;

            this.backup_point2_pt_coor = {}
            this.backup_point2_pt_coor.x = this.point2.pt_c.x;
            this.backup_point2_pt_coor.y = this.point2.pt_c.y;
        }
        this.backup_start_pt_coor = {};
        this.backup_end_pt_coor = {};
        this.backup_start_pt_coor.x = this.start_ppointt_coor.x;
        this.backup_start_pt_coor.y = this.start_pt_coor.y;
        this.backup_end_pt_coor.x = this.end_pt_coor.x;
        this.backup_end_pt_coor.y = this.end_pt_coor.y;
    }

    restore_self() {
        if (this.show_control_pts) {
            this.point1.updateLocByCoor(this.backup_point1_pt_coor.x, this.backup_point1_pt_coor.y)
            this.point2.updateLocByCoor(this.backup_point2_pt_coor.x, this.backup_point2_pt_coor.y)
        }

        this.start_pt_coor.x = this.backup_start_pt_coor.x;
        this.start_pt_coor.y = this.backup_start_pt_coor.y;
        this.end_pt_coor.x = this.backup_end_pt_coor.x;
        this.end_pt_coor.y = this.backup_end_pt_coor.y;
    }

    restore() {
        this.restore_self();

        for (var i = 0; i < this.attached_points_info.length; i++) {
            this.attached_points_info[i].item.restore();
        }
    }

    setPreRotateCallback(callback) {
        this.pre_rotate_callback = callback;
    }

    setPostRotateCallback(callback) {
        this.post_rotate_callback = callback;
    }

    pointToShap(x, y, item) {
        if (item != undefined) {
            if (item.attached_segment_info != undefined) {
                var pt = this.getIntersectionPoint(item.attached_segment_info.item);
                pt = this.stage.getPixFromCoor(pt.x, pt.y)
                return { dist: Funcs.measureDistance({ x: x, y: y }, pt), x: pt.x, y: pt.y, id: this.id, item: this }
            }
            else if (item.attached_circle_info != undefined) {
                //console.log("attached circle")
                //return bla bla
                return { dist: 9999999, x: NaN, y: NaN, id: this.id, item: this };
            }
        }
        var segment_len = Funcs.measureDistance({ x: this.point1.pt_px.x, y: this.point1.pt_px.y }, { x: this.point2.pt_px.x, y: this.point2.pt_px.y })

        var m = (this.point2.pt_px.y - this.point1.pt_px.y) / (this.point2.pt_px.x - this.point1.pt_px.x);
        var c = this.point2.pt_px.y - (m * this.point2.pt_px.x);

        if (isFinite(m)) {
            var intersect_x = ((m * y + x) - (m * c)) / (m ** 2 + 1);
            var intersect_y = m * intersect_x + c;
        }
        else {
            var intersect_x = this.point1.pt_px.x;
            var intersect_y = y;
        }

        var dist_from_start_px = Funcs.measureDistance({ x: this.point1.pt_px.x, y: this.point1.pt_px.y }, { x: intersect_x, y: intersect_y })
        var dist_from_end_px = Funcs.measureDistance({ x: this.point2.pt_px.x, y: this.point2.pt_px.y }, { x: intersect_x, y: intersect_y })

        var dist;
        var min_dist;
        var near_x, near_y;
        if (Math.abs(segment_len - (dist_from_start_px + dist_from_end_px)) < 0.001) { // intesect point is between start and end points
            min_dist = Funcs.measureDistance({ x: intersect_x, y: intersect_y }, { x: x, y: y });
            near_x = intersect_x;
            near_y = intersect_y;

            dist = Funcs.measureDistance({ x: this.point2.pt_px.x, y: this.point2.pt_px.y }, { x: x, y: y }) / 1.5;

            if (dist < 10) {
                near_x = this.point2.pt_px.x;
                near_y = this.point2.pt_px.y;
                min_dist = dist;
            }
            else {
                dist = Funcs.measureDistance({ x: this.point1.pt_px.x, y: this.point1.pt_px.y }, { x: x, y: y }) / 1.5;
                if (dist < 10) {
                    near_x = this.point1.pt_px.x;
                    near_y = this.point1.pt_px.y;
                    min_dist = dist;
                }
            }
        }
        else {
            if (dist_from_start_px > segment_len) { // near to end point
                min_dist = Funcs.measureDistance({ x: this.point2.pt_px.x, y: this.point2.pt_px.y }, { x: x, y: y }) / 1.5;
                near_x = this.point2.pt_px.x;
                near_y = this.point2.pt_px.y;
            }
            else { // near to start point
                min_dist = Funcs.measureDistance({ x: this.point1.pt_px.x, y: this.point1.pt_px.y }, { x: x, y: y }) / 1.5;
                near_x = this.point1.pt_px.x;
                near_y = this.point1.pt_px.y;
            }
        }

        return { dist: min_dist, x: near_x, y: near_y, id: this.id, item: this }
    }

    getSlope() {
        return (this.point2.pt_c.y - this.point1.pt_c.y) / (this.point2.pt_c.x - this.point1.pt_c.x)
    }

    getLength() {
        return Funcs.measureDistance(this.point1.pt_c, this.point2.pt_c);
    }

    setParent(parent) { // set parent item for this segment, parents are usually larger item such as Triangle, Rectangle, Circle ...
        this.parent = parent;
    }

    getPercentFromStart(pt) {
        return Funcs.measureDistance(this.point1.pt_c, pt) / this.getLength();
    }

    getPointOfPercFromStart(percent) {
        return { x: this.start_pt_coor.x + ((this.end_pt_coor.x - this.start_pt_coor.x) * percent), y: this.start_pt_coor.y + ((this.end_pt_coor.y - this.start_pt_coor.y) * percent) }
    }

    getIntersectionPoint(segment) {
        // formula at https://www.desmos.com/calculator/ttc86liti9
        var X = this.point1.pt_c.x;
        var Y = this.point1.pt_c.y;
        var X1 = this.point2.pt_c.x;
        var Y1 = this.point2.pt_c.y;
        var Xn = segment.point1.pt_c.x;
        var Yn = segment.point1.pt_c.y;
        var Xn1 = segment.point2.pt_c.x;
        var Yn1 = segment.point2.pt_c.y;

        var m = (Y - Y1) / (X - X1);
        var mn = (Yn - Yn1) / (Xn - Xn1);

        var intersect_x = ((mn * Xn1) - (m * X1) + Y1 - Yn1) / (mn - m)
        var intersect_y = (m * intersect_x) - (m * X1) + Y1

        var start_x1 = Math.min(this.point1.pt_c.x, this.point2.pt_c.x)
        var end_x1 = Math.max(this.point1.pt_c.x, this.point2.pt_c.x)
        var start_y1 = Math.min(this.point1.pt_c.y, this.point2.pt_c.y)
        var end_y1 = Math.max(this.point1.pt_c.y, this.point2.pt_c.y)

        var start_x2 = Math.min(segment.point1.pt_c.x, segment.point2.pt_c.x)
        var end_x2 = Math.max(segment.point1.pt_c.x, segment.point2.pt_c.x)
        var start_y2 = Math.min(segment.point1.pt_c.y, segment.point2.pt_c.y)
        var end_y2 = Math.max(segment.point1.pt_c.y, segment.point2.pt_c.y)


        if (Funcs.arePointsEqual({ x: intersect_x, y: intersect_y }, { x: this.point1.pt_c.x, y: this.point1.pt_c.y }) || Funcs.arePointsEqual({ x: intersect_x, y: intersect_y }, { x: this.point2.pt_c.x, y: this.point2.pt_c.y })) {
            return { x: NaN, y: NaN }
        }
        else if (start_x1 <= intersect_x && intersect_x <= end_x1 && start_y1 <= intersect_y && intersect_y <= end_y1 && start_x2 <= intersect_x && intersect_x <= end_x2 && start_y2 <= intersect_y && intersect_y <= end_y2) {
            return { x: intersect_x, y: intersect_y };
        }
        else {
            return { x: NaN, y: NaN };
        }
    }

    isSibling(child) {    // call from child item. if parameter "child" is a sibling of calling child, return true.
        if (this.parent != undefined) {
            var ret = this.parent.isSibling(child);
            if (ret) {
                return true;
            }
        }
        if (this.point1.id == child.id || this.point2.id == child.id) {
            return true;
        }

        if (child.parent != undefined) {
            if (child.parent.id == this.id) {
                return true;
            }
        }

        return false;
    }

    isParent(item) { // return true, if this is the parent of "item"
        if (this.parent != undefined) {
            if (this.parent.id == item.id) {
                return true;
            }
        }
        return false;
    }

    isChild(child) {
        if (child.id == this.point1.id || child.id == this.point2.id) {
            return true;
        }
    }

    updatePointSnapping(point, info) {
        if (info.type = Point) {
            this.point.updateLocByCoor(info.item.pt_coor.x, info.item.pt_coor.y);
        }
        else if (info.type == Segment) {

        }
    }

    isOnSegment(pt) {
        var slope_seg = (this.point2.pt_c.y - this.point1.pt_c.y) / (this.point2.pt_c.x - this.point1.pt_c.x)
        var slope_to_pt = (pt.y - this.point1.pt_c.y) / (pt.x - this.point1.pt_c.x)
        var in_x_range = (Math.min(this.point1.pt_c.x, this.point2.pt_c.x) - 0.000000000001 <= pt.x && pt.x <= Math.max(this.point1.pt_c.x, this.point2.pt_c.x) + 0.000000000001)

        var in_y_range = (Math.min(this.point1.pt_c.y, this.point2.pt_c.y) - 0.000000000001 <= pt.y && pt.y <= Math.max(this.point1.pt_c.y, this.point2.pt_c.y) + 0.000000000001)

        var ret = ((Math.abs(slope_seg - slope_to_pt) <= 0.0000000001) && in_x_range && in_y_range);
        if (ret) {
            return true;
        }
        else {
            if (Funcs.arePointsEqual(pt, this.point1.pt_c) || Funcs.arePointsEqual(pt, this.point2.pt_c)) {
                return true;
            }
            return false;
        }
    }

    getSupportVector() {
        var formula = this.getLineFormula();
        var x = - formula.c / (formula.m + (1 / formula.m));
        return { x: x, y: formula.m * x + formula.c };
    }

    getLineFormula() {
        var m = (this.point2.pt_c.y - this.point1.pt_c.y) / (this.point2.pt_c.x - this.point1.pt_c.x);
        return { m: m, c: this.point1.pt_c.y - (m * this.point1.pt_c.x) }
    }

    getIntersectionPoints(item) {

        if (item.constructor.name == "Segment") {
            if (this.parent != undefined && item.parent != undefined && this.parent.id == item.parent.id) {
                return [];
            }

            return [this.getIntersectionPoint(item)];
        }
        else if (item.constructor.name == "Circle") {
            return item.getIntersectionPtsWithSeg(this);
        }
        return undefined;
    }

    isInBox(pt) {
        var start_x = Math.min(this.point1.pt_c.x, this.point2.pt_c.x)
        var start_y = Math.min(this.point1.pt_c.y, this.point2.pt_c.y)
        var end_x = Math.max(this.point1.pt_c.x, this.point2.pt_c.x)
        var end_y = Math.max(this.point1.pt_c.y, this.point2.pt_c.y)

        if (start_x <= pt.x && pt.x <= end_x && start_y <= pt.y && pt.y <= end_y) {
            return true;
        }
        else {
            return false;
        }
    }

    getOtherPt(pt) {
        if (pt.id == this.point1.id) {
            return this.point2;
        }
        else if (pt.id == this.point2.id) {
            return this.point1;
        }
        else {
            return undefined;
        }
    }

    name() {
        return "segment. " + this.id;
    }
}