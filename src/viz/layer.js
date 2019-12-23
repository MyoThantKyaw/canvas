import { Funcs } from "./utils/Funcs.js"
import { SelectionManager } from "./selectionManager.js"
import { SmallPoint } from "./items/smallPoint.js";

export class Layer {
    constructor() {
        this.items = []

        this.small_point_items = [];

        this.point_items = []
        this.angle_items = [];
        this.area_items = [];
        this.segment_items = []

        // equal z-index
        this.triangle_items = []
        this.rectangle_items = [];
        this.circle_items = []

        this.large_items = [];
        //
        this.tap_everytime_callbacks = []
        this.selected_items_id = [];

        this.angle_id_counter = 0;
        this.area_id_counter = 0;
    }

    startDrawing(stage) {
        this.stage = stage;

        var parentTag = document.getElementById("container")
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext('2d');

        this.canvas.style.position = "absolute";
        this.canvas.style.background = "transparent";
        this.canvas.style.zIndex = 10;
        this.canvas.style.width = stage.canvas_dim.width + "px";
        this.canvas.style.height = stage.canvas_dim.height + "px";
        parentTag.appendChild(this.canvas);
        this.canvas_dim = this.canvas.getBoundingClientRect();

        this.selection_mgr = new SelectionManager();
        this.dpr = stage.makeHighResolution(this.canvas, this.canvas_dim, this.context);
        this.stage.addTapListenerEverytime(this, (x, y) => {
            var nearest_item = this.findItemToSelect(x, y)
            var nearest_item_id = -10;

            if (nearest_item != undefined) {
                this.moveItemToTop(nearest_item)

                if (this.isInSelectionList(nearest_item.id)) {  // if the item is already selected, unselect it
                    if (nearest_item.constructor.name == "Triangle") {
                        for (var i = 0; i < nearest_item.segments.length; i++) {
                            nearest_item.segments[i].unselect();
                            this.selection_mgr.unselectItem(nearest_item.segments[i]);
                        }
                    }
                    this.removeFromSelectionList(nearest_item.id);
                    nearest_item.unselect();
                    this.selection_mgr.unselectItem(nearest_item);
                }
                else { // only if the item was not selected before, it can be selected.
                    this.selected_items_id.push(nearest_item.id)
                    nearest_item.select();
                    this.selection_mgr.selectItem(nearest_item);

                    if (nearest_item.constructor.name == "Triangle" || nearest_item.constructor.name == "Rectangle") {
                        for (var i = 0; i < nearest_item.segments.length; i++) {
                            nearest_item.segments[i].select();
                            this.selection_mgr.selectItem(nearest_item.segments[i]);
                        }
                    }
                }
                nearest_item_id = nearest_item.id;
            }
            else { // clear selection list...
                this.selected_items_id.splice(0, this.selected_items_id.length)
                this.selection_mgr.unselectAll();

                // unselect all item except item in "this.selected_items_id"
                for (var i = 0; i < this.point_items.length; i++) {
                    this.point_items[i].unselect();
                }

                for (var i = 0; i < this.segment_items.length; i++) {
                    this.segment_items[i].unselect();
                }

                for (var i = 0; i < this.large_items.length; i++) {
                    this.large_items[i].unselect();
                }
            }

            this.render();
        })
    }

    // returns nearest point, item, stegment, or curve to (x, y)
    // min_dist is in pixel
    findItemToSelect(x, y) {

        var min_index;
        var nearest_item_info;
        var min_dist = 9999999;

        // find in points..
        if (this.point_items.length >= 1) {
            for (var i = this.point_items.length - 1; i >= 0; i--) {
                if (!this.point_items[i].is_visible) continue;
                if (!this.point_items[i].is_visible && this.point_items[i].parent == undefined) {
                    continue;
                }
                nearest_item_info = this.point_items[i].isInPath(x, y);

                if (min_dist > nearest_item_info.dist) {
                    min_index = i;
                    min_dist = nearest_item_info.dist;
                }
            }
            if (min_dist < 15) {
                return this.point_items[min_index];
            }
        }

        // find in segements..
        if (this.segment_items.length >= 1) {
            for (var i = this.segment_items.length - 1; i >= 0; i--) {
                if (!this.segment_items[i].is_visible) continue;
                nearest_item_info = this.segment_items[i].isInPath(x, y);

                if (min_dist > nearest_item_info.dist) {
                    min_index = i;
                    min_dist = nearest_item_info.dist;
                }
            }
            if (min_dist < 10) {
                return this.segment_items[min_index];
            }
        }

        var min_area = 9999999999999;
        var area;
        min_dist = 99;

        if (this.large_items.length >= 1) {
            for (var i = this.large_items.length - 1; i >= 0; i--) {
                if (!this.large_items[i].is_visible) continue;
                nearest_item_info = this.large_items[i].isInPath(x, y);
                area = this.large_items[i].getArea();

                if (0 == nearest_item_info.dist && area < min_area) {
                    min_index = i;
                    min_dist = nearest_item_info.dist;
                    min_area = area;
                }
            }
            if (min_dist == 0) {
                return this.large_items[min_index];
            }
        }

        return undefined;
    }

    findPointToSnapForSeg(seg) {
        for (var i = 0; i < this.point_items.length; i++) {

        }
    }

    // (x, y) in pixel.......
    findPointToSnap(pt, item = undefined) {

        var min_index;
        var nearest_item_info;
        var min_dist = 9999999;
        var min_info;

        // find in points..
        if (this.point_items.length >= 1) {
            for (var i = 0; i < this.point_items.length; i++) {
                if (this.point_items[i].id == item.id) { continue; }

                if (item.parent != undefined) {
                    if (item.parent.isSibling(this.point_items[i]) || item.parent.isAttachedTo(this.point_items[i])) { continue };
                }

                if (item.isAttachedToForPoint(this.point_items[i])) {
                    continue;
                }

                if (item.constructor.name == "Point") {
                    if (item.attached_circle_info != undefined && this.point_items[i].attached_circle_info == undefined) {
                        continue;
                    }
                }
                else if (item.constructor.name == "Segment") {

                }

                nearest_item_info = this.point_items[i].pointToShap(pt.x, pt.y);

                if (min_dist > nearest_item_info.dist) {
                    min_info = nearest_item_info;
                    min_index = i;
                    min_dist = nearest_item_info.dist;
                }
            }
            if (min_dist < 10) {
                return min_info;
            }
        }

        // find in segements..
        if (this.segment_items.length >= 1) {
            for (var i = 0; i < this.segment_items.length; i++) {
                if (item.constructor.name == "Point") {
                    if (item.parent != undefined) {
                        if (item.parent.id == this.segment_items[i].id) continue;
                    }
                    if (item.isParentOfAttachedItem(this.segment_items[i])) continue;
                    if (item.attached_segment_info != undefined && item.attached_segment_info.item.id == this.segment_items[i].id) continue;
                }

                if (item.isAttachedTo(this.segment_items[i])) continue;

                if (item.parent != undefined) {
                    if (item.parent.isSibling(this.segment_items[i]) || item.parent.isAttachedTo(this.segment_items[i])) { continue };
                }

                nearest_item_info = this.segment_items[i].pointToShap(pt.x, pt.y, item);

                if (min_dist > nearest_item_info.dist) {
                    min_info = nearest_item_info;
                    min_index = i;
                    min_dist = nearest_item_info.dist;
                }
            }
            if (min_dist < 10) {
                return min_info;
            }
        }

        if (this.large_items.length >= 1) {
            for (var i = 0; i < this.large_items.length; i++) {
                var constru_name = this.large_items[i].constructor.name;
                if (constru_name == "Triangle" || constru_name == "Rectangle" ) {
                    continue;
                }
                if (item.parent != undefined && item.parent.id == this.large_items[i].id) {
                    continue;
                }
                if (item.attached_circle_info != undefined && item.attached_circle_info.item.id == this.large_items[i].id) {
                    continue;
                }
                nearest_item_info = this.large_items[i].pointToShap(pt.x, pt.y, item);

                if (min_dist > nearest_item_info.dist) {
                    min_info = nearest_item_info;
                    min_index = i;
                    min_dist = nearest_item_info.dist;
                }
            }
            if (min_dist < 10) {
                return min_info;
            }
        }
        return undefined;
    }

    updateSmallPoints(updating_item) {
        this.updateMeasurements();
        this.small_point_items = [];

        for (var i = 0; i < this.selection_mgr.selectedItems.length; i++) {

            var selected_item = this.selection_mgr.selectedItems[i];
            if(selected_item.constructor.name == "Point") continue;

            if ((updating_item != undefined && updating_item.id == selected_item.id) || selected_item.constructor.name == "Triangle" || selected_item.constructor.name == "Rectangle") continue;
            var pts;
            var item;
            for (var j = 0; j < this.segment_items.length; j++) {
                item = this.segment_items[j];
                if (updating_item != undefined && updating_item.id == item.id) continue;
                if (item.id == selected_item.id) continue;

                if (this.isInSelectedItems(item, i)) continue;

                pts = selected_item.getIntersectionPoints(item);
                if (pts != undefined) {
                    for (var k = 0; k < pts.length; k++) {
                        if (!isNaN(pts[k].x)) {

                            if (selected_item.parent != undefined) {
                                var item1_id = selected_item.parent.id;
                            }
                            else {
                                var item1_id = selected_item.id;
                            }

                            if (item.parent != undefined) {
                                var item2_id = item.parent.id;
                            }
                            else {
                                var item2_id = item.id;
                            }

                            var point = new SmallPoint(pts[k].x, pts[k].y);
                            point.item1_id = item1_id;
                            point.item2_id = item2_id;
                            this.addItem(point);
                        }

                    }
                }
            }
            for (var j = 0; j < this.large_items.length; j++) {
                item = this.large_items[j];
                if (this.isInSelectedItems(item, i) || (item.constructor.name == "Triangle") || (item.constructor.name == "Rectangle")) continue;
                if (item.id == selected_item.id) continue;
                pts = selected_item.getIntersectionPoints(item);
                if (pts != undefined) {
                    for (var k = 0; k < pts.length; k++) {
                        if (!isNaN(pts[k].x)) {
                            if (selected_item.parent != undefined) {
                                var item1_id = selected_item.parent.id;
                            }
                            else {
                                var item1_id = selected_item.id;
                            }

                            if (item.parent != undefined) {
                                var item2_id = item.parent.id;
                            }
                            else {
                                var item2_id = item.id;
                            }

                            var point = new SmallPoint(pts[k].x, pts[k].y);
                            point.item1_id = item1_id;
                            point.item2_id = item2_id;
                            this.addItem(point);
                        }
                    }
                }
            }
        }
    }

    removeFromSmallPts(item) {
        if (item.parent != undefined) {
            var id = item.parent.id;
        }
        else {
            var id = item.id;
        }

        for (var i = 0; i < this.small_point_items.length; i++) {
            if (this.small_point_items[i].item1_id == id || this.small_point_items[i].item2_id == id) {
                this.small_point_items[i].setVisible(false);
            }
        }
    }

    isInSelectedItems(item, index) {
        for (var i = index - 1; i >= 0; i--) {
            if (this.selection_mgr.selectedItems[i].id == item.id) {
                return true;
            }
        }
        return false;
    }

    addItem(item) {
        this.items.push(item);
        var id;

        if (item.constructor.name == "Angle") {
            this.angle_items.push(item);
            id = "ang" + this.angle_id_counter++;
        }
        else if (item.constructor.name == "Area") {
            this.area_items.push(item);
            id = "ar" + this.area_id_counter++;
        }
        else if (item.constructor.name == "Point") {
            item.current_index = this.point_items.length;
            this.point_items.push(item);
            id = "pt" + this.point_items.length;
        }
        else if (item.constructor.name == "Segment") {
            item.current_index = this.segment_items.length;
            this.segment_items.push(item);
            id = "sg" + this.segment_items.length;
        }
        else if (item.constructor.name == "Triangle") {
            item.current_index = this.large_items.length;
            this.large_items.push(item);
            id = "tr" + this.large_items.length;
        }
        else if (item.constructor.name == "Rectangle") {
            item.current_index = this.large_items.length;
            this.large_items.push(item);
            id = "rect" + this.large_items.length;
        }
        else if (item.constructor.name == "Circle") {
            item.current_index = this.large_items.length;
            this.large_items.push(item);
            id = "cir" + this.large_items.length;
        }
        else if (item.constructor.name == "SmallPoint") {

            this.small_point_items.push(item);
            id = "sm-pt" + this.small_point_items.length;
        }

        item.setContext(this.stage, this.context, this, id);
    }

    addTapAlwaysListener(item) {
        this.tap_everytime_callbacks.push(item);
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateSmallPoints();

        var i;

        for (i = this.large_items.length - 1; i >= 0; i--) {
            if (this.large_items[i].is_visible) {
                this.large_items[i].render();
            }
        }

        for (i = 0; i < this.segment_items.length; i++) {
            if (this.segment_items[i].is_visible) {
                this.segment_items[i].render();
            }
        }

        for (i = 0; i < this.small_point_items.length; i++) {
            if (this.small_point_items[i].is_visible) {
                this.small_point_items[i].render();
            }
        }

        for (i = 0; i < this.area_items.length; i++) {
            this.area_items[i].render();
        }

        for (i = 0; i < this.angle_items.length; i++) {
            this.angle_items[i].render();
        }

        for (i = 0; i < this.point_items.length; i++) {
            if (this.point_items[i].is_visible) {
                this.point_items[i].render();
            }
        }
    }

    updateMeasurements() {
        var i;
        for (i = 0; i < this.angle_items.length; i++) {
            this.angle_items[i].update();
        }

        for (i = 0; i < this.area_items.length; i++) {
            this.area_items[i].update();
        }
    }

    updatePxLocations() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        var i;

        for (i = 0; i < this.point_items.length; i++) {
            this.point_items[i].updatePixelLoc()
        }

        for (i = 0; i < this.small_point_items.length; i++) {
            this.small_point_items[i].updatePixelLoc()
        }

        for (i = 0; i < this.segment_items.length; i++) {
            this.segment_items[i].updatePixelLoc()
        }

        for (i = 0; i < this.angle_items.length; i++) {
            this.angle_items[i].update()
        }

        for (i = 0; i < this.area_items.length; i++) {
            this.area_items[i].update()
        }

        for (i = 0; i < this.large_items.length; i++) {
            if (this.large_items[i].constructor.name == "Circle") {
                this.large_items[i].updatePixelValues()
            }
        }

        this.render();
    }

    calculateIntersectionPts() {

    }

    moveItemToTop(item) {
        var itemListToChange;
        if (item.constructor.name == "Point") {
            itemListToChange = this.point_items;
        }

        else if (item.constructor.name == "Segment") {
            itemListToChange = this.segment_items;
        }

        else if (item.constructor.name == "Triangle" || item.constructor.name == "Rectangle") {
            itemListToChange = this.large_items;
        }

        else if (item.constructor.name == "Circle") {
            itemListToChange = this.large_items;
        }

        for (var i = item.current_index + 1; i < itemListToChange.length; i++) {
            itemListToChange[i].current_index = i - 1;
        }

        Funcs.arraymove(itemListToChange, item.current_index, itemListToChange.length - 1);
        item.current_index = itemListToChange.length - 1;
    }

    name() {
        return "layer";
    }

    isInSelectionList(id) {
        for (var i = 0; i < this.selected_items_id.length; i++) {
            if (this.selected_items_id[i] == id) {
                return true;
            }
        }
        return false;
    }

    removeFromSelectionList(id) {
        var index = this.selected_items_id.indexOf(id);
        if (index > -1) {
            this.selected_items_id.splice(index, 1);
        }
    }

    removeAngleItem(item) {
        for (var i = 0; i < this.angle_items.length; i++) {
            if (this.angle_items[i].id == item.id) {
                this.angle_items.splice(i, 1);
                break;
            }
        }
    }

    removeAreaItem(item){
        for (var i = 0; i < this.area_items.length; i++) {
            if (this.area_items[i].id == item.id) {
                this.area_items.splice(i, 1);
                break;
            }
        }
    }
}