// Programmed By: Andrew Ciambrone

//Handling the Canvas
var canvas = document.getElementById("canvas");
fitToContainer(canvas);

function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

var ctx = canvas.getContext("2d");
dpr = window.devicePixelRatio || 1;
bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

var pixelratio = dpr / bsr;

canvas.width = canvas.width * pixelratio;
canvas.height = canvas.height * pixelratio;


//Adding Listeners 
canvas.addEventListener("mousedown", mausDown);
canvas.addEventListener("mouseup", mausUp);
canvas.addEventListener("mousemove", mausMove);

// canvasWidth and height variables
var canvasWidth = canvas.width - 75;
var canvasHeight = canvas.height;
var BB = canvas.getBoundingClientRect();
var offsetX = BB.left;
var offsetY = BB.top;

var sectionHeight = 0;
var topHeight = 0;
var middleHeight = 0;
var bottomHeight = 0;

// Data structures
var sections = [];
var weights = [];

//Constants
var numDataSets = 7;
var hradius = 0;
var wradius = 0;


var weightNames = ["Crime", "Cost of Living", "Education", "Unemployment", "Income", "Commute Time", "Health"];
var dragok = {i:-1, j:-1};

function init() {
	//Init Sections
	sectionHeight = canvasHeight/numDataSets;
	topHeight = sectionHeight*0.2; //top gets 1/5
	middleHeight = sectionHeight*0.6; //Middle gets 3/5
	bottomHeight = sectionHeight*0.2; //bottom gets 1/5
	for (var i = 0; i<numDataSets; i++)
	{
		sections.push({top:{x:0,y:(i*sectionHeight), width:canvasWidth + 75, height:topHeight},
					   middle:{x:0,y:(i*sectionHeight + topHeight), width:canvasWidth + 75, height:middleHeight},
					   bottom:{x:0,y:(i*sectionHeight + topHeight + middleHeight), width:canvasWidth + 75, height:bottomHeight}
					  });
	}

	hradius = middleHeight/2;
	wradius = hradius *1.5;
	//ADD the button
	weights.push([{x:canvasWidth/2, y:(topHeight + (middleHeight/2)), isButton:true, label:"", isDragging:false}]);
}



function draw() 
{
	clear();
	//drawSections();
	drawPopUp();
	drawWeights();
	
}

function drawSections() {
	for(var i = 0; i < sections.length; i++)
	{

		var t = sections[i].top;
		var m = sections[i].middle;
		var b = sections[i].bottom;
		//console.log(t);
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#FFFFFF";
		ctx.rect(t.x, t.y, t.width, t.height);
		ctx.stroke();
		ctx.rect(m.x, m.y, m.width, m.height);
		ctx.stroke();
		ctx.rect(b.x, b.y, b.width, b.height);
		ctx.stroke();
	}
}

function drawWeights() {
	for (var i=0; i<weights.length; i++)
	{
		for (var j=0; j<weights[i].length; j++)
		{
			var weight = weights[i][j];
			if (weight.isButton)
			{
				drawAddButton(weight.x, weight.y);
			} else {
				drawLabelCircle(weight.x, weight.y, weight.label);
			}
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
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#003300";
    ctx.stroke();
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


function updateWeights() {
	var w = weights[dragok.i][dragok.j];
	//Base Case: If there are only items in the bar
	//The add button and the first weight. 
	if(weights.length < 3 && weights[0].length < 2 && weights[1] < 2)
	{
		w.x = canvasWidth/2;
		w.y = (topHeight + (middleHeight/2));
		return;
	}


	var sec = returnSection(w.x, w.y);
	//Puts it on the top of the list
	if (sec == 0)
	{
		weights.unshift([w]);
		//We are shifting everything down by one so we need to adjust the i.
		dragok.i = dragok.i + 1;
		removeSelected();
		resetWeightPosition();
		return;
	}

	for (var i = 1; i < weights.length + 1; i++)
	{
		//If the section is a middle point
		if (sec == i+((i-1)*2))
		{
			if (weights[i-1][0].isButton)
			{   //Hack that prevents adding a weight next to the add button
				weights[i-2].push(w);
			} else
			{
				weights[i-1].push(w);
			}
			removeSelected();
			resetWeightPosition();
			return;
		}
		//if the section is after a middle sectionsection.
		if (sec == i+((i-1)*2)+1 || sec == i+((i-1)*2)+2)
		{
			if(weights[i-1][0].isButton)
			{ //Hack that prevents adding a weight under the add button
				weights.splice(i-1,1, [w]);
				weights.push([{x:canvasWidth/2, y:(sectionHeight*(i+1) + topHeight + (middleHeight/2)), isButton:true, label:"", isDragging:false}]);
			} else
			{
				weights.splice((i),0, [w]);
				if (dragok.i > (i-1))
				{
					dragok.i = dragok.i + 1;
				}
			}
			
			removeSelected()
			resetWeightPosition();
			return;
		}
	}

	if (counter < 6)
	{
		weights.splice(i-2,1, [w]);
		weights.push([{x:canvasWidth/2, y:(sectionHeight*(i+1) + topHeight + (middleHeight/2)), isButton:true, label:"", isDragging:false}]);
	} else {
		weights.push([w]);
	}
	removeSelected()
	resetWeightPosition()
}

function removeSelected()
{
	//Remove from list
	if (weights[dragok.i].length > 1)
	{
		//Remove from a level with more then one weight
		weights[dragok.i].splice(dragok.j,1);
	} else 
	{
		//Remove from a level with only one weight
		weights.splice(dragok.i, 1);
	}
}

function resetWeightPosition()
{
	for (var i=0; i<weights.length; i++)
	{
		var yOffset = (sectionHeight*(i) + topHeight + (middleHeight/2));

		
		for (var j=0; j<weights[i].length; j++)
		{
			var xOffset = 0;
			if (weights[i].length <2)
			{
				xOffset = canvasWidth/2;
			} else
			{
				xOffset = canvasWidth/(weights[i].length + 1) + j*(canvasWidth/(weights[i].length + 1));
			}
			weights[i][j].y = yOffset;
			weights[i][j].x = xOffset;
		}
	}
}

function returnSection(x, y)
{
	for(var i = 0; i < sections.length; i++)
	{

		var t = sections[i].top;
		var m = sections[i].middle;
		var b = sections[i].bottom;

		if ((x >= t.x && x <= t.x + t.width) && (y >= t.y && y <= t.y + t.height))
		{
			return i*3;
		}
		if ((x >= m.x && x <= m.x + m.width) && (y >= m.y && y <= m.y + m.height))
		{
			return i*3 + 1;
		}
		if ((x >= b.x && x <= b.x + b.width) && (y >= b.y && y <= b.y + b.height))
		{
			return i*3 + 2;
		}
	}
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
		section.push({name:label, x:(x+hradius + 10), y:((y - hradius - 10) + i*(h*1.0)), h:h/1.125});
		if (w > maxWidth)
		{
			maxWidth = w;
		}
	}
	 
	popUp = {xOrigin:x, yOrigin:y, x:(x+hradius + 10), y:(y - hradius - 10), width:(maxWidth*1.0), height:popupHeight, sections:section};

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
			//ctx.strokeStyle = "#000000";
			//ctx.rect(rec.x, rec.y, popUp.width, h);
			//ctx.lineWidth = 1;
			//ctx.stroke();
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
    mx = mx*pixelratio;
    my = my*pixelratio;
    // For popUps
    if (popUp != null)
    {
    	//if Null clicked outside so clear
    	var clic = inText(mx, my, popUp.sections);
    	if (clic == null)
    	{
    		popUp = null;

    	} else {
    		weights.splice(weights.length - 1,1, [{x:canvasWidth/2, y:popUp.yOrigin , isButton:false, label:clic.name, isDragging:false}]);
		    
		    if (counter < numDataSets-1)
		    {
		        weights.push([{x:canvasWidth/2, y:(sectionHeight*(weights.length) + topHeight + (middleHeight/2)), isButton:true, label:"", isDragging:false}]);

		    }
		    var index = weightNames.indexOf(clic.name);
		    if (index !== -1)
		    {
		    	weightNames.splice(index, 1);
		    }

		    counter = counter +  1;
		    popUp = null;
		    updateMap();
		    
    	}

    	return;
    }

    dragok = {i:-1, j:-1};
    for (var i=0; i<weights.length; i++)
	{
		for (var j=0; j<weights[i].length; j++)
		{
	     	var w = weights[i][j];
	     	var d = (((mx - w.x)*(mx - w.x))/(wradius*wradius)) + (((my - w.y)*(my - w.y))/(hradius*hradius))
	        //var d = distance(w.x, mx, w.y, my);
	        if (d <= 1)
	        {
	            if (w.isButton)
	            {
	            	createAddPopUp(w.x+(hradius*0.8), w.y);	                
	            } else {
	             	dragok = {i:i, j:j};
	            }
	            startX = mx;
    			startY = my;
	            return;
	        }
   		}
    }
}

function mausUp(e) {
    // tell the browser we're handling this mouse event
	e.preventDefault();
    e.stopPropagation();
    if (dragok.i != -1)
    {
    	updateWeights();
    	updateMap();
    }
    dragok = {i:-1, j:-1};
    draw();
    
}

function mausMove(e) {
    // tell the browser we're handling this mouse event
	e.preventDefault();
    e.stopPropagation();
   
    if (dragok.i != -1) {
        var mx=parseInt(e.clientX-offsetX);
        var my=parseInt(e.clientY-offsetY);
        mx = mx*pixelratio;
    	my = my*pixelratio;
        
        var dx= mx - startX;
        var dy= my - startY;
        
        weights[dragok.i][dragok.j].x+=dx;
        weights[dragok.i][dragok.j].y+=dy;
            	    
        startX = mx;
        startY = my;
        draw();
    }
}


init();
draw();