import { Triangle } from "./items/triangle";
import { Funcs } from "./utils/Funcs";
import { Angle } from "./measurements/angle";
import { Rectangle } from "./items/rectangle";
import { Area } from "./measurements/area";
import { Circle } from "./items/circle";
import { Segment } from "./items/segment";

export class DrawingManager {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.drawing_mode = false;
        this.item_type_to_draw = undefined;
        this.item = undefined;
    }

    changeToDrawingMode(item_type_to_draw) {
        this.drawing_mode = true;
        this.item = undefined;
        this.item_type_to_draw = item_type_to_draw;
    }

    escape() {
        this.drawing_mode = false;
        this.item = undefined;
    }

    // called by layer..
    tap(pt) { // pt in cooridnate..
        if (this.item_type_to_draw == "Segment") {
            if (this.item == undefined || (this.item != undefined && this.item.point2 != undefined)) {
                var newSegment = new Segment();
                this.layer.addItem(newSegment)
                this.item = newSegment;
                newSegment.addPoint(pt);
            }
            else {
                this.item.addPoint(pt);
            }
            this.layer.render()   
        }
        else if (this.item_type_to_draw == "Triangle") {
            if (this.item == undefined || (this.item != undefined && this.item.is_visible)) {
                var newTriangle = new Triangle();
                newTriangle.setMovable();
                this.layer.addItem(newTriangle)
                this.item = newTriangle;
                newTriangle.addVertex(pt);
            }
            else {
                this.item.addVertex(pt);
            }
            this.layer.render()
        }
        else if (this.item_type_to_draw == "Rectangle") {
            if (this.item == undefined || (this.item != undefined && this.item.is_visible)) {
                var newRectangle = new Rectangle();
                newRectangle.setMovable();
                this.layer.addItem(newRectangle)
                this.item = newRectangle;
                newRectangle.addVertex(pt);
            }
            else {
                this.item.addVertex(pt);
            }
            this.layer.render()
        }
        else if (this.item_type_to_draw == "Circle") {
            if (this.item == undefined || (this.item != undefined && this.item.is_visible)) {
                var newCircle = new Circle();
                newCircle.setMovable();
                this.layer.addItem(newCircle)
                this.item = newCircle;
                newCircle.setCenter(pt);
            }
            else {
                var radius = Funcs.measureDistance({x : pt.x, y : pt.y}, this.item.center_c);
                this.item.setRadius(radius);
            }
            this.layer.render();
        }
        else if (this.item_type_to_draw == "Area") {
            var pt_px = this.stage.getPixFromCoor(pt.x, pt.y)
            
            var nearest_item = this.layer.findItemToSelect(pt_px.x, pt_px.y);
            
            if(nearest_item == undefined) return;
            var name = nearest_item.constructor.name;
            if(name == "Circle" || name == "Rectangle" || name == "Triangle"){
                var area = new Area(nearest_item);
                this.layer.addItem(area);
                this.layer.render();
            }
            else{
                return;
            }
        }
        else if (this.item_type_to_draw == "Angle") {
            var bundles = [];

            for (var i = 0; i < this.layer.segment_items.length; i++) {

                var bundle = getBundle(this.layer.segment_items[i].point1.pt_c);
                if (bundle == undefined) {
                    var dist = Funcs.measureDistance(pt, this.layer.segment_items[i].point1.pt_c);
                    var pointBundle = new PointBundle(this.layer.segment_items[i].point1.pt_c, dist);
                    pointBundle.addPoint(this.layer.segment_items[i].point1);

                    var k;
                    for (k = 0; k < bundles.length; k++) {
                        if (bundles[k].dist > pointBundle.dist) {
                            bundles.splice(k, 0, pointBundle);
                            break;
                        }
                    }
                    if (k == bundles.length) {
                        bundles.push(pointBundle)
                    }
                }
                else {
                    bundle.addPoint(this.layer.segment_items[i].point1);
                }
                bundle = getBundle(this.layer.segment_items[i].point2.pt_c);
                if (bundle == undefined) {

                    var dist = Funcs.measureDistance(pt, this.layer.segment_items[i].point2.pt_c);
                    var pointBundle1 = new PointBundle(this.layer.segment_items[i].point2.pt_c, dist);
                    pointBundle1.addPoint(this.layer.segment_items[i].point2)

                    for (k = 0; k < bundles.length; k++) {
                        if (bundles[k].dist > pointBundle1.dist) {
                            bundles.splice(k, 0, pointBundle1);
                            break;
                        }
                    }
                    if (k == bundles.length) {
                        bundles.push(pointBundle1)
                    }
                }
                else {
                    bundle.addPoint(this.layer.segment_items[i].point2);
                }
            }

            for (var i = 0; i < bundles.length; i++) {
                if (bundles[i].points.length < 2) continue;

                var smaller_angle = undefined;
                var larger_angle = undefined;

                var angle_to_pt = Math.atan2((pt.y - bundles[i].pt_coor.y), (pt.x - bundles[i].pt_coor.x));
                if (angle_to_pt <= 0) {
                    angle_to_pt = (2 * Math.PI) + angle_to_pt;
                }

                for (var m = 0; m < 2; m++) {
                    for (var j = 0; j < bundles[i].points.length; j++) {
                        var angle = bundles[i].points[j].angle + (m * Math.PI * 2);
                        
                        if (angle < angle_to_pt ) {
                            smaller_angle = bundles[i].points[j];
                        }
                        else if (angle > angle_to_pt && larger_angle == undefined) {
                            larger_angle = bundles[i].points[j];
                        }
                    }
                }

                if (smaller_angle == undefined) {
                    smaller_angle = bundles[i].points[bundles[i].points.length - 1];  
                }

                var angle = new Angle(smaller_angle.point.parent, larger_angle.point.parent);

                this.layer.addItem(angle);
                this.layer.render();
                break;
            }

            function getBundle(pt) {
                for (var l = 0; l < bundles.length; l++) {
                    if (Funcs.arePointsEqual(bundles[l].pt_coor, pt)) {
                        return bundles[l];
                    }
                }
                return undefined;
            }
        }
    }
}

class PointBundle {
    constructor(pt_coor, dist) {
        this.pt_coor = pt_coor;
        this.dist = dist;
        this.points = [];
    }

    addPoint(point) {
        if (!(point.parent != undefined && point.parent.constructor.name == "Segment")) return;

        var other_pt = point.parent.getOtherPt(point);
        var angle = Math.atan2(other_pt.pt_c.y - point.pt_c.y, other_pt.pt_c.x - point.pt_c.x)

        if (angle <= 0) {
            angle = (2 * Math.PI) + angle;
        }

        var pt_info = { point: point, angle: angle };
        var i;
        for (i = 0; i < this.points.length; i++) {
            if (this.points[i].angle > pt_info.angle) {
                this.points.splice(i, 0, pt_info);
                break;
            }
        }
        if (i == this.points.length) {
            this.points.push(pt_info);
        }
    }
}