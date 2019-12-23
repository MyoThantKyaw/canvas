import { Stage } from "./viz/stage.js"
import { Grid } from "./viz/grid.js"
import { Layer } from "./viz/layer.js";
import { Point } from "./viz/items/point.js"
import { Curve } from "./viz/items/curve.js"

import { Segment } from "./viz/items/segment.js"
import { Triangle } from "./viz/items/triangle.js"
import { Circle } from "./viz/items/circle.js";
import { SmallPoint } from "./viz/items/smallPoint.js";
import { Angle } from "./viz/measurements/angle.js";
import { DrawingManager } from "./viz/drawingManager.js";


var layer1;
var tri;
var drawingManager;
function init() {
  var stage = new Stage("canvas");

  var grid = new Grid();
  stage.addLayer(grid);

  layer1 = new Layer();
  stage.addLayer(layer1);
  grid.link(layer1);

  var dw_mgr = new DrawingManager(layer1);
  stage.setDrawingManger(dw_mgr);
  // var pt = new Point(3, 0, 10);
  // layer1.addItem(pt);
  // pt.setMovable();

  // var pt1 = new Point(1, 2);
  // layer1.addItem(pt1);
  // pt1.setMovable((x, y) => {
  //   if ((0 < x) && (x < 2) && (0 < y) && (y < 5)) {

  //   }
  //   else {
  //     pt1.preventMoving = true;
  //   }

  // });

  // var pt2 = new Point(3, -3, 4, "#2D70B3");
  // pt2.setMovable();
  // layer1.addItem(pt2);
  
  var pt2 = new SmallPoint(3, -3);
  layer1.addItem(pt2);

  // var seg = new Segment({ x: 1, y: 2 }, { x: 1, y: 3 },  "#2D70B3", 2, true)
  // layer1.addItem(seg);
  // seg.setMovable();
  
  // var seg4 = new Segment({ x: -1, y: 2 }, { x: 1, y: 3 },  "#2D70B3", 2, true)
  // layer1.addItem(seg4);
  // seg4.setMovable();
  var seg1 = new Segment({ x: 1, y: 1 }, { x: -3, y: 2 }, "#2D70B3")
  seg1.setMovable();
  layer1.addItem(seg1);
  var seg2 = new Segment({ x: 1, y: 1 }, { x: 0, y: 0 }, "#ff00f1")
  layer1.addItem(seg2);

  var circle = new Circle({x : 0, y : 0}, 2);
  circle.setMovable();
  layer1.addItem(circle);

  var circle1 = new Circle({x : -4, y : 1}, 2, "#00c400");
  circle1.setMovable();
  layer1.addItem(circle1);

  var angle = new Angle( seg2, seg1);
  layer1.addItem(angle);

  // tri = new Triangle();
  // layer1.addItem(tri);
  // tri.addPoint([-1, 3])
  // tri.setMovable();
  // tri.addPoint([1, 1])
  // tri.addPoint([-3, 1])
  layer1.render();

  drawingManager = new DrawingManager(stage, layer1);
  stage.setDrawingManger(drawingManager);

};

function click() {
  drawingManager.escape();
}

function circleClick(){
  drawingManager.changeToDrawingMode("Circle");
}

function trigClick(){
  drawingManager.changeToDrawingMode("Triangle");
}

function angleClick(){
  drawingManager.changeToDrawingMode("Angle");
}

function rectClick(){
  drawingManager.changeToDrawingMode("Rectangle");
}

function areaClick(){
  drawingManager.changeToDrawingMode("Area");
}

function segClick(){
  drawingManager.changeToDrawingMode("Segment");
}

document.trigClick = trigClick;
document.angClick = angleClick;
document.handleClick = click;
document.rectClick = rectClick;
document.areaClick = areaClick;
document.circleClick = circleClick;
document.segClick = segClick;



init();
