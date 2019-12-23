
export class Grid {
    constructor() {
        this.steps = [5, 2, 1];
        this.scale_by = 1.05;
        this.linked_layers = [];

        this.is_visible = true;
    }

    startDrawing(stage) {
        this.stage = stage;

        var parentTag = document.getElementById("container");
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext('2d');

        this.canvas.style.position = "absolute";
        this.canvas.style.width = stage.canvas_dim.width + "px"
        this.canvas.style.height = stage.canvas_dim.height + "px"
        this.canvas.style.background = "transparent";
        this.canvas.style.zIndex = 0;
        parentTag.appendChild(this.canvas);
        this.canvas_dim = this.canvas.getBoundingClientRect();

        this.dpr = stage.makeHighResolution(this.canvas, this.canvas_dim, this.context);

        this.stage.addMouseWheelListener(this, e => {
            this.mouse_loc_coor = this.stage.getCoorFromPix(e.clientX, e.clientY);
            this.stage.left = this.mouse_loc_coor.x - ((this.mouse_loc_coor.x - this.stage.left) * (this.scale_by ** Math.sign(e.deltaY)));
            this.stage.right = this.stage.left + (this.stage.width * (this.scale_by ** Math.sign(e.deltaY)));
            this.stage.width = this.stage.right - this.stage.left;
            this.stage.bottom = this.mouse_loc_coor.y - ((this.mouse_loc_coor.y - this.stage.bottom) * (this.scale_by ** Math.sign(e.deltaY)));
            this.stage.top = this.stage.bottom + (this.stage.height * (this.scale_by ** Math.sign(e.deltaY)));
            this.stage.height = this.stage.top - this.stage.bottom;
            this.stage.pixel_coor_ratio = this.canvas_dim.width / this.stage.width;

            this.render();
        });

        this.stage.addMouseDownListener(this,
            (pt_coor) => {
                var pt_px = this.stage.getPixFromCoor(pt_coor.x, pt_coor.y);
                this.last_mouse_x = pt_px.x;
                this.last_mouse_y = pt_px.y;
            },
            (x, y) => {

                this.last_mouse_loc_coor = this.stage.getCoorFromPix(this.last_mouse_x, this.last_mouse_y);
                this.mouse_loc_coor = this.stage.getCoorFromPix(x, y);

                this.stage.left = this.stage.left - (this.mouse_loc_coor.x - this.last_mouse_loc_coor.x);
                this.stage.right = this.stage.left + this.stage.width;
                this.stage.bottom = this.stage.bottom - (this.mouse_loc_coor.y - this.last_mouse_loc_coor.y);
                this.stage.top = this.stage.bottom + this.stage.height;

                this.last_mouse_x = x;
                this.last_mouse_y = y;

                this.render();
            }
        );

        var pinch_handler = e => {
            this.scale = this.last_scale / e.scale;

            this.mouse_loc_coor = this.stage.getCoorFromPix(e.center.x, e.center.y)
            this.last_mouse_loc_coor = this.stage.getCoorFromPix(this.last_mouse_x, this.last_mouse_y)

            this.stage.left = this.mouse_loc_coor.x - ((this.mouse_loc_coor.x - this.stage.left) * this.scale) - (this.mouse_loc_coor.x - this.last_mouse_loc_coor.x);
            this.stage.right = this.stage.left + (this.stage.width * this.scale);
            this.stage.width = this.stage.right - this.stage.left;

            this.stage.bottom = this.mouse_loc_coor.y - ((this.mouse_loc_coor.y - this.stage.bottom) * this.scale) - (this.mouse_loc_coor.y - this.last_mouse_loc_coor.y);
            this.stage.top = this.stage.bottom + (this.stage.height * this.scale);
            this.stage.height = this.stage.top - this.stage.bottom;

            this.last_scale = e.scale;

            console.log("scale " + e.scale)
            this.last_mouse_x = e.center.x;
            this.last_mouse_y = e.center.y;

            this.stage.pixel_coor_ratio = this.canvas_dim.width / this.stage.width;

            this.render();
        };

        this.stage.addPinchStartListener(this, e => {
            this.last_scale = 1;
            this.last_mouse_x = e.center.x;
            this.last_mouse_y = e.center.y;

            this.stage.setPinch_worker(pinch_handler)
        });
        
        if(this.canvas_dim.width > 1000){
            var initial_scale = 0.02;    
        }
        else if(this.canvas_dim.width > 300){
            var initial_scale = 0.033;
        }
        
        this.stage.left = (-this.canvas_dim.width / 2) * initial_scale;
        this.stage.right = (this.canvas_dim.width / 2) * initial_scale;
        this.stage.width = this.stage.right - this.stage.left;
        this.stage.top = (this.canvas_dim.height / 2) * initial_scale;
        this.stage.bottom = (-this.canvas_dim.height / 2) * initial_scale;
        this.stage.height = this.stage.top - this.stage.bottom;

        this.stage.pixel_coor_ratio = this.canvas_dim.width / this.stage.width;
        this.render();
    }

    link(layer) {
        this.linked_layers.push(layer);
    }

    render(check = false, x = 0, y = 0) {
        if (check) {
            return true;
        }

        this.context.clearRect(0, 0, this.canvas_dim.width, this.canvas_dim.height);
        this.go = true;
        this.n = 1;
        while (this.go) {
            this.steps_multi = this.steps.map(x => { return x * (10 ** (this.stage.width.toFixed(0).toString().length - this.n)) })
            console.log("this.stage.width " + this.stage.width)
            console.log("this.stage.width.toFixed(0).toString().length " + this.stage.width.toFixed(0).toString().length);
            console.log("-------")

            this.n++;

            for (i = 0; i < this.steps_multi.length; i++) {
                this.pixel_per_step = this.canvas_dim.width / (this.stage.width / this.steps_multi[i]);
                if (this.pixel_per_step < 120) {
                    this.go = false;
                    this.left_to_start = Math.ceil(this.stage.left / this.steps_multi[i]) * this.steps_multi[i];
                    this.bottom_to_start = Math.ceil(this.stage.bottom / this.steps_multi[i]) * this.steps_multi[i];
                    this.step = this.steps_multi[i];
                    break;
                }
            }
        }

        this.to_exponential = false;

        if ((Math.abs(this.left_to_start) > 100000 || Math.abs(1 / this.left_to_start) > 100000) && this.left_to_start != 0) {
            this.to_exponential = true;
        }

        this.context.beginPath();
      
        this.context.lineWidth = 1;
        this.context.textAlign = 'center';
        this.context.font = '10pt Calibri';
        this.context.strokeStyle = '#d0d0d0';

        this.position_origin = this.stage.getPixFromCoor(0, 0);
        this.beyond_top = false;
        this.beyond_bottom = false;
        this.beyond_left = false;
        this.beyond_right = false;

        if(this.position_origin.y < 0){
            this.beyond_top = true;
            this.context.fillStyle = '#858585';
        }
        else if(this.position_origin.y + 15 > this.canvas_dim.height){
            this.beyond_bottom = true;
            this.context.fillStyle = '#858585';
        }
        else{
            this.context.fillStyle = '#3d3d3d';
        }
    
        this.no_of_ticks_x = (this.stage.width / this.step) + 1
        for (var i = 0; i < this.no_of_ticks_x; i++) {
            this.pt_for_lb = (this.left_to_start + (i * this.step)).toFixed(10)
            this.tick_value = parseFloat(this.pt_for_lb);

            this.tick_pos_px = this.stage.getPixFromCoor(this.tick_value, 0);
            if(this.beyond_top){
                this.tick_pos_px.y = 0
            }
            else if(this.beyond_bottom){
                this.tick_pos_px.y = this.canvas_dim.height - 15;
            }
           
            this.context.moveTo(this.tick_pos_px.x, this.tick_pos_px.y - 2);
            this.context.lineTo(this.tick_pos_px.x, this.tick_pos_px.y + 2);

            this.context.moveTo(this.tick_pos_px.x, this.canvas_dim.height);
            this.context.lineTo(this.tick_pos_px.x, 0);
            

            if (!this.to_exponential && this.tick_value != 0) {
                this.context.fillText(this.tick_value, this.tick_pos_px.x, this.tick_pos_px.y + 12)
            }
            else if (this.tick_value != 0) {
                this.context.fillText(this.tick_value.toExponential(), this.tick_pos_px.x, this.tick_pos_px.y + 12)
            }
            else {
                this.context.fillText("0", this.tick_pos_px.x - 5, this.tick_pos_px.y + 11)
            }
        }

        if (this.position_origin.x - 10 < 0) {
            this.beyond_left = true;
            this.context.fillStyle = '#858585';
        }
        else if(this.position_origin.x > this.canvas_dim.width){
            this.beyond_right = true;
            this.context.fillStyle = '#858585';
        }
        else{
            this.context.textAlign = 'right';
            this.context.fillStyle = '#3d3d3d';
        }
        
        this.no_of_ticks_y = (this.stage.height / this.step) + 1
        for (var i = 0; i < this.no_of_ticks_y; i++) {
            this.pt_for_lb = (this.bottom_to_start + (i * this.step)).toFixed(10)
            this.tick_value = parseFloat(this.pt_for_lb);

            this.tick_pos_px = this.stage.getPixFromCoor(0, this.tick_value);

            if(this.beyond_left){
                this.tick_pos_px.x = 5
                this.context.textAlign = 'left';
            }
            else if(this.beyond_right){
                this.tick_pos_px.x = this.canvas_dim.width ;
                this.context.textAlign = 'right';
            }

            this.context.moveTo(this.tick_pos_px.x - 2, this.tick_pos_px.y);
            this.context.lineTo(this.tick_pos_px.x + 2, this.tick_pos_px.y);

            this.context.moveTo(0, this.tick_pos_px.y);
            this.context.lineTo(this.canvas_dim.width, this.tick_pos_px.y);

            if (!this.to_exponential && this.tick_value != 0) {
                this.context.fillText(this.tick_value, this.tick_pos_px.x - 3, this.tick_pos_px.y + 3.5)
            }
            else if (this.tick_value != 0) {
                this.context.fillText(this.tick_value.toExponential(), this.tick_pos_px.x - 3, this.tick_pos_px.y + 3.5)
            }
        }
        
        this.context.stroke();

        this.x_ax_start = this.stage.getPixFromCoor(this.stage.left, 0);
        this.x_ax_end = this.stage.getPixFromCoor(this.stage.right, 0);
        this.y_ax_start = this.stage.getPixFromCoor(0, this.stage.bottom);
        this.y_ax_end = this.stage.getPixFromCoor(0, this.stage.top);

        this.context.beginPath();
        this.context.strokeStyle = '#757575';
        this.context.lineWidth =1.4;

        this.context.moveTo(this.x_ax_start.x, this.x_ax_start.y);
        this.context.lineTo(this.x_ax_end.x, this.x_ax_end.y);
        this.context.moveTo(this.y_ax_start.x, this.y_ax_start.y);
        this.context.lineTo(this.y_ax_end.x, this.y_ax_end.y);
        this.context.stroke();

        // update pixel locations of linked layer
        for (var i = 0; i < this.linked_layers.length; i++) {
            this.linked_layers[i].updatePxLocations();
        }

        return false;
    }

    isInPath(x, y) {
        return { dist: 0, x: NaN, y: NaN, id: -1 };
    }
}
