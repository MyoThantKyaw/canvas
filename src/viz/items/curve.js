export class Curve {
    constructor(func, color, lineWidth = 2.3) {
        this.func = func;
        this.color = color;
        this.current_color = this.getRBGFromHex(color, 0.75);
        this.tolerance = 10; // in pixel
        this.lineWidth = lineWidth;
        this.is_selected = false;
        this.selection_color = this.getRBGFromHex(color, 1);
        this.selection_callback = undefined;
        this.unselection_callback = undefined;
    }

    setContext(stage, context, layer) {
        this.context = context;
        this.stage = stage;
        this.layer = layer;

        this.start_point_coor = this.stage.left;
        this.end_point_coor = this.stage.right;

        this.start_point_px = this.stage.getPixFromCoor(this.start_point_coor, 0).x;
        this.end_point_px = this.stage.getPixFromCoor(this.end_point_coor, 0).x;

        this.no_points = (this.end_point_px - this.start_point_px) / 2;
        this.delta_coor = (this.end_point_coor - this.start_point_coor) / this.no_points;
    }

    listenSelection(callback){

    }

    listenUnselection(callback){
        
    }

    render(check = false, x = 0, y = 0) {
        this.context.beginPath();
        this.context.lineWidth = this.lineWidth;
        this.context.strokeStyle = this.current_color;
        this.context.moveTo(this.start_point_px, this.stage.getPixFromCoorY(this.func(this.start_point_coor)))

        for (var i = 1; i < this.no_points; i++) {
            this.context.lineTo(this.start_point_px + (i * 2), this.stage.getPixFromCoorY(this.func(this.start_point_coor + (i * this.delta_coor))))
        }

        this.context.lineTo(this.end_point_px, this.stage.getPixFromCoorY(this.func(this.end_point_coor)));

        if (check) {
            return false;
        }

        this.context.stroke();

        return false;
    }

    updatePixelLoc() {
        this.start_point_coor = this.stage.left;
        this.end_point_coor = this.stage.right;

        this.start_point_px = this.stage.getPixFromCoor(this.start_point_coor, 0).x;
        this.end_point_px = this.stage.getPixFromCoor(this.end_point_coor, 0).x;

        this.no_points = (this.end_point_px - this.start_point_px) / 2;
        this.delta_coor = (this.end_point_coor - this.start_point_coor) / this.no_points;
    }

    pointToShap(x, y){
        
    }

    isInPath(x, y){
        return (Math.abs(this.stage.getPixFromCoorY(this.func(this.stage.getCoorFromPixX(x))) - y ) < this.tolerance);
    }

    //rgba(56, 140, 70, 1)
    getRBGFromHex(value, alpha = 1){
        return "rgba(" + parseInt(value.substring(1,3), 16) + ", " + parseInt(value.substring(3,5), 16) + ", " + parseInt(value.substring(5,7), 16) + ", " + alpha +")";
    }   
}
