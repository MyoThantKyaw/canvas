
require("hammerjs")

export class Stage {
    constructor(canvas_id) { 
        this.canvas = document.getElementById(canvas_id);
        this.context = this.canvas.getContext('2d');
        this.canvas_dim = canvas.getBoundingClientRect();
        this.context.beginPath();
        this.context.lineWidth = 3;
        this.pixel_coor_ratio = 1;
        // for (var i = 0; i <= 36; i++) {

        //     this.context.moveTo(i - 1, (i - 1) ** 2);
        //     this.context.lineTo(i, i ** 2);
        //     this.context.stroke();
        // }

        //100 iterations
        // var counter = 0, x = 0, y = 180;
        // var increase = 90 / 180 * Math.PI / 9;
        // for (var i = 0; i <= 360; i += 10) {

        //     this.context.moveTo(x, y);
        //     x = i;
        //     y = 180 - Math.sin(counter) * 120;
        //     counter += increase;

        //     this.context.lineTo(x, y);
        //     this.context.stroke();
        // }

        // round line join (middle)
        this.context.beginPath();
        this.context.moveTo(239, 150);
        this.context.lineTo(289, 50);
        this.context.lineTo(339, 150);
        this.context.lineJoin = 'round';
        this.context.stroke();

        // bevel line join (right)
        this.context.beginPath();
        this.context.moveTo(379, 150);
        this.context.lineTo(429, 50);
        this.context.lineTo(479, 150);
        this.context.lineJoin = 'bevel';
        this.context.stroke();

        // boundary informations
        this.left = 0;
        this.right = this.canvas_dim.width;
        this.width = this.canvas_dim.width;
        this.bottom = 0;
        this.top = this.canvas_dim.height;
        this.height = this.canvas_dim.height;

        // ******************************** //
        this.ham = new Hammer(this.canvas, {
            domEvents: true,
        });

        this.ham.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 0 });
        this.ham.get('pinch').set({ enable: true, threshold: 0 });

        this.layerCount = 0;
        this.layers = [];

        // save events listeners...
        this.mouseDown_items = []
        this.mouseDown_callback = []
        this.mouseMove_items = []
        this.mouseMove_callback = []
        this.mouseMove_worker = undefined;
        this.mouseUp_worker = undefined;
        this.mouseWheel_items = []
        this.mouseWheel_callback = []
        this.pinchStart_items = []
        this.pinchStart_callback = []
        this.pinch_items = []
        this.pinch_callback = []
        this.pinch_worker = undefined;
        this.tap_items = [];
        this.tap_callback = [];
        this.tap_items_everytime = [];
        this.tap_callback_everytime = [];

        this.mouseDown_point_items = []
        this.mouseDown_point_callbacks = []
        this.mouseMove_point_callbacks = []

        this.mouseDown_segment_items = []
        this.mouseDown_segment_callbacks = []
        this.mouseMove_segment_callbacks = []

        this.mouseDown_large_items = []
        this.mouseDown_large_callbacks = []
        this.mouseMove_large_callbacks = []

        this.mouseDown_grid_items = []
        this.mouseDown_grid_callbacks = []
        this.mouseMove_grid_callbacks = []

        this.mouse_down_index = -1;
        this.mouse_down_item_type = undefined;

        this.makeHighResolution(this.canvas, this.canvas_dim, this.context)

        this.canvas.addEventListener("wheel", e => {
            for (var i = this.mouseWheel_items.length - 1; i >= 0; i--) {
                var hasPoint = this.mouseWheel_items[i].render(true, e.clientX, e.clientY);
                if (hasPoint) {
                    this.mouseWheel_callback[i](e);
                    return;
                }
            }
        });

        var panStartHandler = e => {
            var nearest_item_callback = this.findItemForMouseDown(e.center.x, e.center.y);
            if (nearest_item_callback != undefined) {
                if (this.mouse_down_item_type != "Grid") {

                    // for(var i = 0; i < this.layers.length; i++){
                    //     if(this.layers[i].constructor.name == "Grid") continue;

                    //     this.layers[i].removeFromSmallPts(this.mouse_down_item);
                    //     //this.layers[i].render();
                    //    // this.mouseMove_point_callbacks[this.mouse_down_index]
                    // }
                }

                nearest_item_callback(this.getCoorFromPix(e.center.x, e.center.y))
            }
        }

        this.ham.on("panstart", panStartHandler);

        this.ham.on("panmove", e => {

            if (this.mouse_down_index == -1) {
                return;
            }

            if (this.mouse_down_item_type == "Point") {
                this.mouseMove_point_callbacks[this.mouse_down_index](this.getCoorFromPix(e.center.x, e.center.y))

            }
            else if (this.mouse_down_item_type == "Segment") {
                this.mouseMove_segment_callbacks[this.mouse_down_index](this.getCoorFromPix(e.center.x, e.center.y))
            }

            else if (this.mouse_down_item_type == "LargeItem") {
                this.mouseMove_large_callbacks[this.mouse_down_index](this.getCoorFromPix(e.center.x, e.center.y))
            }

            else if (this.mouse_down_item_type == "Grid") {
                this.mouseMove_grid_callbacks[this.mouse_down_index](e.center.x, e.center.y)
            }

            // if (this.mouse_down_item_type != "Grid") {
            //     //for (var i = 0; i < this.layers.length; i++) {

            //     this.layers[1].updateSmallPoints();
            //     this.layers[1].updateSmallPoints();
                
            // }
        });

        this.ham.on("panend", e => {
            // if(this.mouse_down_item_type != "Grid"){
            //     console.log("end...")
            //     for(var i = 0; i < this.layers.length; i++){

            //         if(this.layers[i].constructor.name == "Grid") continue;
            //         this.layers[i].updateSmallPoints();
            //         this.layers[i].render();
            //     }
            // }
        });

        this.ham.on("pinchstart", e => {
            for (var i = this.pinchStart_items.length - 1; i >= 0; i--) {
                var hasPoint = this.pinchStart_items[i].render(true, e.center.x, e.center.y);
                if (hasPoint) {
                    this.pinchStart_callback[i](e);
                    return;
                }
            }
        });

        this.ham.on("pinch", e => {
            if (this.pinch_worker == undefined) {
                return;
            }
            this.pinch_worker(e);
        });

        this.ham.on("tap", e => {
            if(this.dw_mgr != undefined && this.dw_mgr.drawing_mode){
                var pt_coor = this.getCoorFromPix(e.center.x, e.center.y)
                this.dw_mgr.tap(pt_coor);
            }
            else{
                for (var i = 0; i < this.tap_callback_everytime.length; i++) {
                    this.tap_callback_everytime[i](e.center.x, e.center.y);
                }
            }
        });
    }

    findItemForMouseDown(x, y) {

        var last_index = -1;
        var nearest_item = undefined;

        for (var i = this.mouseDown_point_items.length - 1; i >= 0; i--) {
            if (!this.mouseDown_point_items[i].is_visible) continue;
            if (this.mouseDown_point_items[i].isInPath(x, y).dist < 17 && this.mouseDown_point_items[i].current_index > last_index) {
                nearest_item = this.mouseDown_point_callbacks[i];
                last_index = this.mouseDown_point_items[i].current_index;
                this.mouse_down_index = i;
                this.mouse_down_item = this.mouseDown_point_items[i];
                this.mouse_down_item_type = "Point";
            }
        }
        if (nearest_item != undefined) return nearest_item;

        last_index = -1;
        for (var i = this.mouseDown_segment_items.length - 1; i >= 0; i--) {
            if (!this.mouseDown_segment_items[i].is_visible) continue;
            if (this.mouseDown_segment_items[i].isInPath(x, y).dist < 10 && this.mouseDown_segment_items[i].current_index > last_index) {
                nearest_item = this.mouseDown_segment_callbacks[i];
                last_index = this.mouseDown_segment_items[i].current_index;
                this.mouse_down_index = i;
                this.mouse_down_item = this.mouseDown_segment_items[i];
                this.mouse_down_item_type = "Segment";
            }
        }
        if (nearest_item != undefined) return nearest_item;

        last_index = -1;
        var min_area = 9999999999999;
        var area;

        for (var i = this.mouseDown_large_items.length - 1; i >= 0; i--) {
            if (!this.mouseDown_large_items[i].is_visible) continue;
            if (this.mouseDown_large_items[i].isInPath(x, y).dist == 0) {

                area = this.mouseDown_large_items[i].getArea();
                if (area < min_area) {
                    nearest_item = this.mouseDown_large_callbacks[i];
                    min_area = area;
                    // last_index = this.mouseDown_large_items[i].current_index;
                    this.mouse_down_item = this.mouseDown_large_items[i];

                    this.mouse_down_index = i;
                    this.mouse_down_item_type = "LargeItem";
                }
            }
        }
        if (nearest_item != undefined) return nearest_item;

        last_index = -1;
        for (var i = this.mouseDown_grid_items.length - 1; i >= 0; i--) {
            if (this.mouseDown_grid_items[i].isInPath(x, y).dist == 0) {
                nearest_item = this.mouseDown_grid_callbacks[i];
                last_index = this.mouseDown_grid_items[i].current_index;
                this.mouse_down_index = i;
                this.mouse_down_item_type = "Grid"
                return nearest_item;
            }
        }
        return nearest_item;
    }

    setMouseMove_worker(callback) {
        this.mouseMove_worker = callback;
    }

    removeMouseMove_worker() {
        this.mouseMove_worker = undefined;
    }

    addMouseDownListener(item, callback, callback1) {
        if (item.constructor.name == "Point") {
            this.mouseDown_point_items.push(item);
            this.mouseDown_point_callbacks.push(callback);
            this.mouseMove_point_callbacks.push(callback1)
        }
        else if (item.constructor.name == "Segment") {
            this.mouseDown_segment_items.push(item);
            this.mouseDown_segment_callbacks.push(callback);
            this.mouseMove_segment_callbacks.push(callback1)
        }
        else if (item.constructor.name == "Triangle" || item.constructor.name == "Circle" || item.constructor.name == "Rectangle") {
            this.mouseDown_large_items.push(item);
            this.mouseDown_large_callbacks.push(callback);
            this.mouseMove_large_callbacks.push(callback1)
        }
        // else if (item.constructor.name == "Circle") {
        // //    console.log("mouse down triangle addeds")
        //     this.mouseDown_circle_items.push(item);
        //     this.mouseDown_circle_callbacks.push(callback);
        //     this.mouseMove_circle_callbacks.push(callback1)
        // }
        else if (item.constructor.name == "Grid") {
            this.mouseDown_grid_items.push(item);
            this.mouseDown_grid_callbacks.push(callback);
            this.mouseMove_grid_callbacks.push(callback1)
        }
    }

    addMouseMoveListener(item, callback) {
        this.mouseMove_items.push(item);
        this.mouseMove_callback.push(callback);
    }

    addMouseWheelListener(item, callback) {
        this.mouseWheel_items.push(item);
        this.mouseWheel_callback.push(callback);
    }

    addPinchStartListener(item, callback) {
        this.pinchStart_items.push(item);
        this.pinchStart_callback.push(callback);
    }

    addPinchListener(item, callback) {
        this.pinch_items.push(item);
        this.pinch_callback.push(callback);
    }

    setPinch_worker(worker) {
        this.pinch_worker = worker;
    }

    addTapListenerEverytime(item, callback) {
        this.tap_items_everytime.push(item);
        this.tap_callback_everytime.push(callback);
    }

    makeHighResolution(canvas, canvas_dim, context) {

        this.devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
            this.context.mozBackingStorePixelRatio ||
            this.context.msBackingStorePixelRatio ||
            this.context.oBackingStorePixelRatio ||
            this.context.backingStorePixelRatio || 1;
        var ratio = this.devicePixelRatio / backingStoreRatio;

        if (this.devicePixelRatio !== backingStoreRatio) {
            var oldWidth = canvas_dim.width;
            var oldHeight = canvas_dim.height;

            canvas.width = Math.round(oldWidth * ratio);
            canvas.height = Math.round(oldHeight * ratio);
            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';
            context.scale(ratio, ratio);
        }
        return this.devicePixelRatio;
    }

    addLayer(layer) {
        this.layerCount++;
        this.layers.push(layer);
        layer.startDrawing(this);
    }

    setDrawingManger(mgr){
        this.dw_mgr = mgr;
    }

    render() {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].render();
        }
    }

    getCoorFromPix(x, y) {
        return { x: this.left + (this.width * (x / this.canvas_dim.width)), y: this.bottom + (this.height * ((this.canvas_dim.height - y) / this.canvas_dim.height)) }
    }

    getCoorFromPixX(x) {
        return this.left + (this.width * (x / this.canvas_dim.width));
    }

    getPixFromCoor(x, y) {
        return { x: this.canvas_dim.width * ((x - this.left) / this.width), y: this.canvas_dim.height - (this.canvas_dim.height * ((y - this.bottom) / this.height)) }
    }

    getPixFromCoorX(x) {
        return this.canvas_dim.width * ((x - this.left) / this.width);
    }

    getPixFromCoorY(y) {
        return this.canvas_dim.height - (this.canvas_dim.height * ((y - this.bottom) / this.height))
    }

    getPixLengthFromCoor(len) {
        return this.pixel_coor_ratio * len;
    }
}