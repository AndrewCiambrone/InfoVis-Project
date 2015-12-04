// Programmed By: Andrew Ciambrone

//Handling the Canvas
var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");

//Adding Listeners 
canvas.addEventListener("mousedown", mausDown);
canvas.addEventListener("mouseup", mausUp);
canvas.addEventListener("mousemove", mausMove);

// canvasWidth and height variables
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var BB = canvas.getBoundingClientRect();
var offsetX = BB.left;
var offsetY = BB.top;

var sectionHeight = 0;
var topHeight = 0;
var middleHeight = 0;
var bottomHeight = 0;

// Data structures
var weights = [];

//Constants
var numDataSets = 7;
var hradius = 0;
var wradius = 0;


var weightNames = ["Crime", "Cost of Living", "Education", "Unemployment", "Income", "Commute Time", "Health"];
var dragok = {i:-1};

function init() {
	hradius = 40/2;
	wradius = 20 *1.5;
	//ADD the button
	weights.push({x:canvasWidth/2, y:canvasHeight-hradius*2, isButton:true, label:""});
}



function draw() 
{
	clear();
	drawLines();
	drawWeights();
	drawPopUp();
}

function drawLines () {
	for (var i=0; i<weights.length; i++)
	{
		var weight = weights[i];
		if (weight.isButton)
			continue;
		ctx.beginPath();
      	ctx.moveTo(canvasWidth*0.9, canvasHeight);
      	ctx.quadraticCurveTo(canvasWidth, weight.y - 20, weight.x, weight.y);
      	ctx.lineWidth = 5;

      	ctx.strokeStyle = "#2ecc71";
      	ctx.stroke();
	}
}

function drawWeights() {
	for (var i=0; i<weights.length; i++)
	{	
		var weight = weights[i];
		if (weight.isButton)
		{
			drawAddButton(weight.x, weight.y);
		} else {
			drawLabelCircle(weight.x, weight.y, weight.label);
		}
	}
}

function drawCircle(x, y) {
	ctx.save();
	ctx.translate(x,y);
    ctx.scale(1.5, 1);
    ctx.beginPath();
	ctx.arc(0,0,hradius,hradius,0,2*Math.PI);
	ctx.closePath();
	ctx.restore();
    ctx.fillStyle = "#2ecc71";
	ctx.fill();
}

function drawAddButton(x, y) {
    drawCircle(x,y);
    ctx.beginPath();
    ctx.moveTo(x,y - hradius/2);
    ctx.lineTo(x,y + hradius/2);
    ctx.closePath();
    ctx.strokeStyle ="white";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x - hradius/2, y);
    ctx.lineTo(x + hradius/2, y);
    ctx.closePath();
    ctx.strokeStyle ="white";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawLabelCircle(x,y,label) {
 	drawCircle(x,y);
    
    ctx.fillStyle = "white"; // font color to write the text with
    var fontsize = hradius;
  	var font = "normal " + fontsize +"px serif";
  	ctx.font = font;
	// Move it down by half the text height and left by half the text canvasWidth
	var w = ctx.measureText(label).width;
	
	while (w > (hradius*1.5)*2)
	{
		fontsize = fontsize*0.99;
		font = "bold " + fontsize +"px serif";
  		ctx.font = font;
  		w = ctx.measureText(label).width;
	}
	var height = ctx.measureText("w").width; // this is a GUESS of height

	ctx.fillText(label, x - (w/2) ,y + (height/2));
}

//Clear the context
function clear() 
{
    ctx.clearRect(0,0,canvasWidth+ 75,canvasHeight);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
}

function distance(x1, x2, y1, y2) {
  return d = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));   
}

var popUp = null;
function createAddPopUp(x, y)
{
	
	var font = "bold " + 15 +"px Verdana";
	ctx.font = font;
	var h = ctx.measureText("w").width*1.125;
	popupHeight = (h)*weightNames.length;
	var maxWidth = 0;
	var section = []; 
	for (var i = 0; i < weightNames.length; i++)
	{ 

		var label = weightNames[i];
		var w = ctx.measureText(label).width;
		section.push({name:label, x:(x+hradius + 10), y:((y - hradius - 60) + i*(h*1.0)), h:h/1.125});
		if (w > maxWidth)
		{
			maxWidth = w;
		}
	}
	 
	popUp = {xOrigin:x, yOrigin:y, x:(x+hradius + 10), y:(y - hradius - 60), width:(maxWidth*1.0), height:popupHeight, sections:section};

}

function drawPopUp()
{
	if (popUp != null)
	{

		ctx.fillStyle= "#C0C0C0";
		ctx.fillRect(popUp.x, popUp.y, popUp.width, popUp.height);
		ctx.beginPath();
		ctx.moveTo(popUp.xOrigin, popUp.yOrigin);
		ctx.lineTo(popUp.x, popUp.y);
		ctx.lineTo(popUp.x, (popUp.y + popUp.height));
		ctx.fill();
		var h = ctx.measureText("w").width; // this is a GUESS of height
		for (var i = 0; i < weightNames.length; i++)
		{
			var rec = popUp.sections[i];
			var label = weightNames[i];
			ctx.fillStyle = "black"; // font color to write the text with
			var font = "bold " + 15 +"px Verdana";
			ctx.font = font;
			// Move it down by half the text height and left by half the text width
			var w = ctx.measureText(label).width;
			
			ctx.fillText(label, popUp.x , popUp.y +h+ i*(h*1.1));
		}
		


		
	}
}

function inText(x, y, texts)
{
	for (var i = 0; i < texts.length; i++)
	{
		var t = texts[i];
		if ((x >= t.x && x <= t.x + popUp.width) && (y >= t.y && y <= t.y + t.h))
		{
			return t;
		}
	}
	return null;
}


var counter = 0;
function mausDown(e) {
    // tell the browser we're handling this mouse event
	e.preventDefault();
    e.stopPropagation();

    var mx = parseInt(e.clientX-offsetX);
    var my = parseInt(e.clientY-offsetY);

    // For popUps
    if (popUp != null)
    {
    	//if Null clicked outside so clear
    	var clic = inText(mx, my, popUp.sections);
    	if (clic == null)
    	{
    		popUp = null;

    	} else {
    		weights.splice(weights.length - 1,1, {x:canvasWidth/2, y:popUp.yOrigin - hradius*2 , isButton:false, label:clic.name, isDragging:false});
		    
		    if (counter < numDataSets-1)
		    {
		        weights.push({x:canvasWidth/2, y:canvasHeight-hradius*2, isButton:true, label:""});

		    }
		    var index = weightNames.indexOf(clic.name);
		    if (index !== -1)
		    {
		    	weightNames.splice(index, 1);
		    }

		    counter = counter +  1;
		    popUp = null;
		    //updateMap();
		    
    	}

    	return;
    }

    dragok = {i:-1};
    for (var i=0; i<weights.length; i++)
	{
	   	var w = weights[i];
	   	var d = (((mx - w.x)*(mx - w.x))/(wradius*wradius)) + (((my - w.y)*(my - w.y))/(hradius*hradius))
	    if (d <= 1)
	    {
	        if (w.isButton)
	        {
	          	createAddPopUp(w.x+(hradius*0.8), w.y);	                
	        } else {
	         	dragok = {i:i};
	        }
	        startX = mx;
    		startY = my;
	        return;
   		}
    }
}

function mausUp(e) {
    // tell the browser we're handling this mouse event
	e.preventDefault();
    e.stopPropagation();
    dragok = {i:-1};
    draw();
    
}

function mausMove(e) {
    // tell the browser we're handling this mouse event
	e.preventDefault();
    e.stopPropagation();
   
    if (dragok.i != -1) {
        var mx=parseInt(e.clientX-offsetX);
        var my=parseInt(e.clientY-offsetY);
        
        var dx= mx - startX;
        var dy= my - startY;
        
        weights[dragok.i].x+=dx;
        weights[dragok.i].y+=dy;
            	    
        startX = mx;
        startY = my;
        draw();
    }
}


init();
draw();