import { Point } from "./point";

export class CircleCenterPoint extends Point {
    constructor(x, y, radius = 3, color = "#388C46") {
        super(x, y, radius, color);
    }
}

CircleCenterPoint.prototype = Object.create(Point.prototype)

CircleCenterPoint.prototype.name = function () {
    //Point.prototype.name.call(this);
    return "circle center point " + this.id;
}


CircleCenterPoint.prototype.tryUpdate = function (requesting_item, is_moving = false) {

    return true;
    // var is_ok_to_update;
    // if (requesting_item == undefined) {

    // }
    // else if (this.parent != undefined && requesting_item.id == this.parent.id) {

    // }
    // else {
    //     if (requesting_item.constructor.name == "Point") {

    //         if (this.attached_segment_info != undefined) {
    //             var is_on_seg = this.attached_segment_info.item.isOnSegment(requesting_item.pt_c)
    //             if (!is_on_seg) {
    //                 // roll back
    //                 console.log("returnn.")
    //                 //return false;
    //             }
    //             else if (this.parent != undefined && requesting_item.id == this.parent.id) {
    //                 this.updateLocByCoor(requesting_item.pt_c.x, requesting_item.pt_c.y);
    //             }
    //             else {
    //                 this.updateLocByCoor(requesting_item.pt_c.x, requesting_item.pt_c.y);
    //             }
    //         }
    //         this.updateLocByCoor(requesting_item.pt_c.x, requesting_item.pt_c.y);

    //     }
    //     // moving..
    //     else if (requesting_item.constructor.name == "Segment") {
    //         var loc_x = requesting_item.start_pt_coor.x - ((requesting_item.start_pt_coor.x - requesting_item.end_pt_coor.x) * this.attached_segment_info.loc)
    //         var loc_y = requesting_item.start_pt_coor.y - ((requesting_item.start_pt_coor.y - requesting_item.end_pt_coor.y) * this.attached_segment_info.loc)

    //         this.updateLocByCoor(loc_x, loc_y);
    //     }

    //     if (this.parent != undefined && this.parent.id != requesting_item.id) {
    //         is_ok_to_update = this.parent.tryUpdate(this);
    //         if (!is_ok_to_update) {
    //             // restore point loc
    //             return is_ok_to_update;
    //         }
    //     }
    //     if (this.attached_segment_info != undefined) {
    //         this.updateLocInAttachedSeg();
    //     }
    // }
    
    // for (var i = 0; i < this.attached_points_info.length; i++) {
    //     if (this.attached_points_info[i].item.id != requesting_item.id) {
    //         this.attached_points_info[i].item.tryUpdate(this);
    //     }
    // }
    // return is_ok_to_update;
}


