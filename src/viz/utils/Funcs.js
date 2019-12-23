
export class Funcs{
    // this function is copied from stackoverflow
    static arraymove(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }
    
    static measureDistance(pt1, pt2){
        return Math.sqrt(((pt1.x - pt2.x) ** 2) + ((pt1.y - pt2.y) ** 2));
    }

    static getMidPoint(pt1, pt2){
        return {x : ((pt1.x - pt2.x) / 2) + pt2.x, y : ((pt1.y - pt2.y) / 2) + pt2.y};
    }

    static arePointsEqual(pt1, pt2){
        return Math.abs(pt1.x - pt2.x) < 0.0000000001 && Math.abs(pt1.y - pt2.y) < 0.0000000001;
    }

    static getUnitVector(vect){
        var norm = Funcs.measureDistance({x : 0, y : 0}, vect);
        return {x : vect.x / norm, y : vect.y / norm};
    }

    static getInterPtOfTwoLines(line1, line2){
        var x = (line2.c - line1.c) / (line1.m - line2.m);
        return {x : x, y : line1.m * x + line1.c};
    }

    static getNorm(vect){
        return Math.sqrt((vect.x ** 2) + (vect.y ** 2));
    }

    static getDotProduct(vect1, vect2){
        return (vect1.x * vect2.x) + (vect1.y * vect2.y)
    }

    //return rgba(56, 140, 70, 1) from "#abcdef"
    static getRBGFromHex(value, alpha = 1) {
        return "rgba(" + parseInt(value.substring(1, 3), 16) + ", " + parseInt(value.substring(3, 5), 16) + ", " + parseInt(value.substring(5, 7), 16) + ", " + alpha + ")";
    }    
    
    static projectToLine(eq, pt) {
        var c_of_point = pt.y + ((1 / eq.m) * pt.x)

        var proj_x = (c_of_point - eq.c) / (eq.m + (1 / eq.m));
        var proj_y = (eq.m * proj_x) + eq.c;

        var pt_on_line = {};
        pt_on_line.x = proj_x;
        pt_on_line.y = proj_y;
        return pt_on_line;
    }
}