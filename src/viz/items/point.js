import { Funcs } from "../utils/Funcs.js"

export class Point {
    constructor(x, y, radius = 3, color = "#388C46") {

        this.pt_c = { x: x, y: y };
        this.r = radius;
        this.stroke_width = 12;

        this.is_selected = false;
        this.core_color = Funcs.getRBGFromHex(color, 1);
        this.border_color = Funcs.getRBGFromHex(color, 0.4);

        this.move_callback = undefined;
        this.parent_id = -1;

        // commom properties..
        this.id = undefined;
        this.current_index = -1;
        this.toSetup_movable = false;
        this.is_visible = true;
        this.is_movable = false;

        this.preventMoving = false;

        this.fixed_constraint = false;
        this.horizontal_constraint = false;
        this.vertical_constraint = false;

        this.snapped_item = undefined;
        this.slope_constraint = undefined;
        this.attached_items = [];

        this.attached_points_info = []
        this.attached_segment_info = undefined;
        this.attached_circle_info = undefined;
        this.point_to_rotate_info = undefined;

        this.use_larger_pt = true;
    }

    setContext(stage, context, layer, id) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;
        this.id = id;

        this.updatePixelLoc();

        if (this.toSetup_movable && !this.is_movable) {
            this.setupForMovable();
        }
    }

    tryUpdate(requesting_item, is_moving = false) {
        if (requesting_item != undefined) {
            if (requesting_item.constructor.name == "Point") {
                if (this.parent != undefined) {
                    if (this.parent.constructor.name == "Segment") {
                        //console.log("parent segment")
                        if (this.parent.isSibling(requesting_item)) {
                            //     console.log("request by sibling..")
                            //if(this.parent.parent)
                            // for (var i = 0; i < this.attached_points_info.length; i++) {

                            //     if (this.attached_points_info[i].item.id != requesting_item.id) {
                            //         this.attached_points_info[i].item.tryUpdate(this);
                            //     }
                            // }
                            this.updateLocByCoor(requesting_item.pt_c.x, requesting_item.pt_c.y);
                        }
                        else {
                            // request by others point..
                            this.updateLocByCoor(requesting_item.pt_c.x, requesting_item.pt_c.y);
                            var centers = this.parent.getAttachedCircleCenters()

                            if (centers.length == 1) {
                                var adjacent_pt = this.parent.getOtherPt(this);
                                var mid_pt = centers[0].item;

                                var vect = { x: mid_pt.pt_c.x - requesting_item.pt_c.x, y: mid_pt.pt_c.y - requesting_item.pt_c.y };
                                var len = Funcs.measureDistance(mid_pt.pt_c, adjacent_pt.pt_c);
                                vect = Funcs.getUnitVector(vect)

                                adjacent_pt.updateLocByCoor((vect.x * len) + mid_pt.pt_c.x, (vect.y * len) + mid_pt.pt_c.y)
                                adjacent_pt.tryUpdate(this)
                            }
                            else {
                               // this.updateLocByCoor(requesting_item.pt_c.x, requesting_item.pt_c.y);
                            }
                        }

                        if (this.parent.attached_points_info.length >= 1) {
                            var circle_center_info = [];
                            for (var i = 0; i < this.parent.attached_points_info.length; i++) {
                                if (this.parent.attached_points_info[i].item.parent != undefined && this.parent.attached_points_info[i].item.parent.constructor.name == "Circle") {
                                    circle_center_info.push(this.parent.attached_points_info[i]);
                                }
                            }

                            if (circle_center_info.length == 1) {
                                var adjacent_pt = this.parent.getOtherPt(this);
                                var mid_pt = circle_center_info[0].item;

                                var vect = { x: mid_pt.pt_c.x - requesting_item.pt_c.x, y: mid_pt.pt_c.y - requesting_item.pt_c.x };
                                var len = Funcs.measureDistance(mid_pt.pt_c, adjacent_pt.pt_c);
                                vect = Funcs.getUnitVector(vect)

                                adjacent_pt.updateLocByCoor((vect.x * len) + mid_pt.pt_c.x, (vect.y * len) + mid_pt.pt_c.y)
                                adjacent_pt.tryUpdate()
                            }
                        }
                    }
                    // requst by others..
                    else {
                    ///    console.log("updated..")
                        this.updateLocByCoor(requesting_item.pt_c.x, requesting_item.pt_c.y);
                    }
                    this.parent.tryUpdate(this);
                }
                // request by sibling
            }
            else if (requesting_item.constructor.name == "Segment") {
                if (this.parent != undefined) {
                    if (this.parent.id == requesting_item.id) {
                        /// for moving.... requst by parent..
                    }
                    else {
                        // request by other segment....
                        var loc_x = requesting_item.point1.pt_c.x - ((requesting_item.point1.pt_c.x - requesting_item.point2.pt_c.x) * this.attached_segment_info.loc)
                        var loc_y = requesting_item.point1.pt_c.y - ((requesting_item.point1.pt_c.y - requesting_item.point2.pt_c.y) * this.attached_segment_info.loc)

                        this.updateLocByCoor(loc_x, loc_y);
                        this.parent.tryUpdate(this);
                    }
                }
                else {

                }
            }
            else if (requesting_item.constructor.name == "Circle") {
                var pt = this.attached_circle_info.item.getPointFromAngle(this.attached_circle_info.angle);
                this.updateLocByCoor(pt.x, pt.y);
                this.parent.tryUpdate(this);
            }
            for (var i = 0; i < this.attached_points_info.length; i++) {
                if (this.attached_points_info[i].item.id != requesting_item.id) {
                    this.attached_points_info[i].item.tryUpdate(this);
                }
            }
        }
        else {
            for (var i = 0; i < this.attached_points_info.length; i++) {
                this.attached_points_info[i].item.tryUpdate(this);
            }
        }
        return;
    }

    findAttachedInfo(item) {
        for (var i = 0; i < this.attached_items.length; i++) {
            if (this.attached_items[i].item === item) {
                return this.attached_items[i];
            }
        }
        return undefined;
    }

    render() {
        this.context.beginPath();
        if (this.is_selected) {
            this.context.lineWidth = 0;
            this.context.arc(this.pt_px.x, this.pt_px.y, this.r + this.stroke_width / 2, 0, 2 * Math.PI, false);

            this.context.fillStyle = this.core_color;
            this.context.strokeStyle = "transparent";
        }
        else {
            this.context.lineWidth = this.stroke_width;
            this.context.arc(this.pt_px.x, this.pt_px.y, this.r, 0, 2 * Math.PI, false);

            this.context.fillStyle = this.core_color;
            this.context.strokeStyle = this.border_color;
        }

        this.context.fill();
        if (this.use_larger_pt) {
            this.context.stroke();
        }
        return undefined;
    }

    addMouseDownListener(callback) {
        this.stage.addMouseDownListener(this, callback);
    }

    addMouseMoveListener(callback) {
        this.mouseMove_worker = callback;
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

    updateLocInAttachedSeg() {
        this.attached_segment_info.loc = this.attached_segment_info.item.getPercentFromStart(this.pt_c);
    }

    backup() {
        this.backup_pt_c = {};
        this.backup_pt_c.x = this.pt_c.x;
        this.backup_pt_c.y = this.pt_c.y;
    }
    restore_self() {
        this.updateLocByCoor(this.backup_pt_c.x, this.backup_pt_c.y);
    }

    restore() {
        this.restore_self();

        for (var i = 0; i < this.attached_points_info.length; i++) {
            this.attached_points_info[i].item.restore();
        }

        this.attached_segment_info.item.restore();
    }

    setParent(parent) {
        this.parent = parent;
    }

    updatePixelLoc() {
        this.pt_px = this.stage.getPixFromCoor(this.pt_c.x, this.pt_c.y);
    }

    updateCoorLoc() {
        this.pt_c = this.stage.getCoorFromPix(this.pt_px.x, this.pt_px.y);
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

    setMoveListener(preMove_callback, callback) {
        this.preMove_callback = preMove_callback;
        this.move_callback = callback;
    }

    setupForMovable() {
        this.stage.addMouseDownListener(this,
            (pt_coor) => { // (x, y) in coordinate
                
                if (this.preMove_callback != undefined) {
                    this.preMove_callback(this.pt_c.x, this.pt_c.y);
                }

                this.diff_mx_coor_x = this.pt_c.x - pt_coor.x;
                this.diff_my_coor_y = this.pt_c.y - pt_coor.y;
                this.layer.moveItemToTop(this);
            },
            (pt_coor) => { //(x, y) in coordinate
                if (this.fixed_constraint) {
                    return;
                }

                if(this.isAttachedToCircleCenter()){
                    return;
                }

                this.backup();

                var new_x = pt_coor.x + this.diff_mx_coor_x;
                var new_y = pt_coor.y + this.diff_my_coor_y;

                // attached to segment of a point that attached to a segment
                if (this.attached_segment_info != undefined) {
                    if (this.attached_segment_info != undefined) {
                        var constraint_seg = this.attached_segment_info.item;
                    }
                    else {
                        var constraint_seg = attached_point_seg.attached_segment_info.item;
                    }
                    var slope_constraint = constraint_seg.getSlope();
                    var c_of_point = this.pt_c.y - (slope_constraint * this.pt_c.x)
                    var slope_of_new_point = -1 / slope_constraint;

                    new_x = ((new_y - (slope_of_new_point * new_x)) - c_of_point) / (slope_constraint - slope_of_new_point);
                    new_y = slope_constraint * new_x + c_of_point;

                    var is_on_seg = constraint_seg.isOnSegment({ x: new_x, y: new_y })

                    /// update childs...
                    if (!is_on_seg) {
                        return;
                    }

                    this.updateLocInAttachedSeg();
                }
                else if (this.attached_circle_info != undefined) {

                    var angle = this.attached_circle_info.item.getAngleOfPoint({ x: new_x, y: new_y });
                    var pt = this.attached_circle_info.item.getPointFromAngle(angle);
                    new_x = pt.x;
                    new_y = pt.y;

                    this.attached_circle_info.angle = angle;
                    this.changeAttachedCircleAngle(angle)
                }

                this.n_item_info = this.layer.findPointToSnap(this.stage.getPixFromCoor(new_x, new_y), this);
                if (this.n_item_info != undefined) {
                    //console.log(this.n_item_info)
                    //    console.log("My parent id " + this.parent.id)
                    //    console.log("attached id " + this.n_item_info.item.id);
                    //    console.log("\n")
                }
                if (this.n_item_info != undefined && this.n_item_info.x != NaN && this.n_item_info.dist < 5) {
                    // snap
                    var item_to_snap = this.n_item_info.item;
                    var pt = this.stage.getCoorFromPix(this.n_item_info.x, this.n_item_info.y)

                    if (!this.isAttachedTo(this.n_item_info.item)) {
                        new_x = pt.x;
                        new_y = pt.y;

                        this.snapped_item = item_to_snap;
                    }
                }
                else { // unsnap
                    // remove from attached items..
                    this.snapped_item = undefined;
                }

                if (this.parent != undefined) {
                    if (this.parent.constructor.name == "Triangle") {

                    }
                    else if (this.parent.constructor.name == "Segment") {
                      
                        if (this.point_to_rotate_info != undefined) {
                            var adjacent_pt = this.point_to_rotate_info.point_to_rotate;
                            var mid_pt = this.point_to_rotate_info.center_pt;

                            var vect = { x: mid_pt.pt_c.x - new_x, y: mid_pt.pt_c.y - new_y };
                            var len = Funcs.measureDistance(mid_pt.pt_c, adjacent_pt.pt_c);
                            vect = Funcs.getUnitVector(vect)
                            var adj_x = (vect.x * len) + mid_pt.pt_c.x;
                            var adj_y = (vect.y * len) + mid_pt.pt_c.y;

                            adjacent_pt.updateLocByCoor(adj_x, adj_y)

                            if(adjacent_pt.attached_circle_info != undefined){
                                var angle = adjacent_pt.attached_circle_info.item.getAngleOfPoint({ x: adj_x, y: adj_y });
                                adjacent_pt.attached_circle_info.angle = angle;
                                adjacent_pt.changeAttachedCircleAngle(angle)
                            }
                            adjacent_pt.tryUpdate()
                        }
                    }
                }
                else {

                }

                this.updateLocByCoor(new_x, new_y);

                if (this.move_callback != undefined) {
                    this.move_callback(new_x, new_y);
                }

                //if the update is succeed
                //     if (i == this.attached_points_info.length && this.attached_segment_info != undefined) {
                //    //     this.updateLocInAttachedSeg();
                //     }
                if (this.parent != undefined) {
                    this.parent.tryUpdate(this);
                }
                this.tryUpdate();

                this.layer.render();
            });
    }

    isAttachedToCircleCenter(){
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.parent != undefined && this.attached_points_info[i].item.parent.constructor.name == "Circle") {
                return true;
            }
        }
        return false;
    }

    updatePixelLoc() {
        this.pt_px = this.stage.getPixFromCoor(this.pt_c.x, this.pt_c.y);
    }

    isChildOfAttachedItems(item) {
        for (var i = 0; i < this.attached_items.length; i++) {
            if (this.attached_items[i].item.isChild(item)) {
                return true;
            }
        }
        return false;
    }

    isParentsAttachedItem(item) {
        for (var i = 0; i < this.parent.attached_items.length; i++) {
            if (this.parent.attached_items[i].item.id == item.id) {
                return true;
            }
        }
        return false;
    }

    isInAttachedItems(id) {
        if (this.attached_segment_info != undefined && this.attached_segment_info.item.id == id) {
            return true;
        }
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.id == id) {
                return true;
            }
        }
        return false;
    }

    addAttachedItem(info) {
        this.attached_points_info.push(info)
    }

    // if the item is large object, dist will be zero and x and y will be NaN.
    // if the previous item's distance is less than threshold, then that item will be selected..
    // if not... current large object is the choice..
    isInPath(x, y) {
        return this.pointToShap(x, y);
    }

    setVisible(visiable) {
        this.is_visible = visiable;
    }

    select() {
        if (this.is_selected) {
            this.unselect();
            return;
        }
        this.is_selected = true;
    }

    // returns {dist , x, y, id}
    pointToShap(x, y) {
        return { dist: Funcs.measureDistance(this.pt_px, { x: x, y: y }), x: this.pt_px.x, y: this.pt_px.y, id: this.id, item: this };
    }

    isParent(item) {
        if (this.parent != undefined && this.parent.id == item.id) {
            return true;
        }
        return false;
    }

    isAttachedToForPoint(item, sender = undefined) {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.id == item.id) {
                return true;
            }
            if (sender != undefined && this.attached_points_info[i].item.id == sender.id) {
                continue;
            }
            var ret = this.attached_points_info[i].item.isAttachedToForPoint(item, this);
            if (ret) {
                return true;
            }
        }
        return false;
    }

    isParentOfAttachedItem(item, sender) {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.parent != undefined && this.attached_points_info[i].item.parent.id == item.id) {
                return true;
            }
            if (sender != undefined && this.attached_points_info[i].item.id == sender.id) {
                continue;
            }
            var ret = this.attached_points_info[i].item.isParentOfAttachedItem(item, this);
            if (ret) {
                return true;
            }
        }
        return false;
    }

    isAttachedTo(item) {
        if (this.attached_segment != undefined) {
            return this.attached_segment.item.id == item.id;
        }
        for (var i = 0; i < this.attached_points_info.length; i++) {
            if (this.attached_points_info[i].item.id == item.id) {
                return true;
            }
            if (this.attached_points_info[i].item.parent != undefined && this.attached_points_info[i].item.parent.id == item.id) {
                return true;
            }
        }
        if (this.parent != undefined) {
            //   return this.parent.isParentOfAttachedItem(item);
        }

        return false;
    }

    setAttachedCircleInfo(attached_circle_info, sender) {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            this.attached_points_info[i].item.attached_circle_info = attached_circle_info;
            if (sender != undefined && this.attached_points_info[i].item.id == sender.id) {
                continue;
            }
            this.attached_points_info[i].item.setAttachedCircleInfo(attached_circle_info, this);
        }
    }

    changeAttachedCircleAngle(angle, sender) {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            this.attached_points_info[i].angle = angle;
            if (sender != undefined && this.attached_points_info[i].item.id == sender.id) {
                continue;
            }
            this.attached_points_info[i].item.changeAttachedCircleAngle(angle, this);
        }
    }

    setPointToRotate(info, sender){
        for (var i = 0; i < this.attached_points_info.length; i++) {
            this.attached_points_info[i].item.point_to_rotate_info = info;
            if (sender != undefined && this.attached_points_info[i].item.id == sender.id) {
                continue;
            }
            
            this.attached_points_info[i].item.setPointToRotate(info, this);
        }
    }

    setAttachedSegmentInfo(info, sender) {
        for (var i = 0; i < this.attached_points_info.length; i++) {
            this.attached_points_info[i].item.attached_segment_info = info;
            if (sender != undefined && this.attached_points_info[i].item.id == sender.id) {
                continue;
            }
            this.attached_points_info[i].item.setAttachedSegmentInfo(info, this);
        }
    }

    getNormalizedVector() {
        var norm = this.getL2Norm();
        return { x: this.pt_c.x / norm, y: this.pt_c.y / norm };
    }

    getL2Norm() {
        return Math.sqrt((this.pt_c.x ** 2 + this.pt_c.y ** 2))
    }

    getDotProduct(pt) {
        return (this.pt_c.x * pt.x) + (this.pt_c.y * pt.y);
    }

    isSnappedTo(item) {
        return this.snapped_item != undefined && this.snapped_item.id == item.id;
    }

    unselect() {
        if (!this.is_selected) {
            return;
        }

        this.is_selected = false;
    }

    name() {
        return "point " + this.id;
    }
}