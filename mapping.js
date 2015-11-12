// Programmed By: Andrew Ciambrone

d3.select(window).on("resize", sizeChange);

var margin = {top: -5, right: -5, bottom: -5, left: -5};
var	width = 385;
var height = 225;
var scale0 = 425;

var rateById = d3.map();

var quantize = d3.scale.quantize().domain([0, 100]).range(d3.range(9).map(function(i) { return "q"+i+"-9"}));

var projection = d3.geo.albersUsa()


var path = d3.geo.path().projection(projection);

var map = null;

var zoom = d3.behavior.zoom()
    .translate([width / 2, height / 2])
    .scale(scale0)
    .scaleExtent([scale0, 8 * scale0])
    .on("zoom", zoomed);

var svg = d3.select("#map-content-wrapper").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");
    
var g = svg.append("g");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)

svg.call(zoom)
    .call(zoom.event);

var educationData = d3.map();
var healthData = d3.map();
var incomeData = d3.map();
var crimeData = d3.map();
var costData = d3.map();
var commuteData= d3.map();
var unemploymentData = d3.map();
var countyName = d3.map();

queue()
  .defer(d3.json, "us.json")
  .defer(d3.csv, "Education_new.csv", function(d) { educationData.set(d.FIPS, parseFloat(d.Score));})
  .defer(d3.csv, "Unemployment_By_County.csv", function(d) { unemploymentData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Commuting_Time_By_County.csv", function(d) { commuteData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Cost_of_Living_By_County.csv", function(d) { costData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Health_new.csv", function(d) { healthData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Income_By_County.csv", function(d) { incomeData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Crime_By_County_new.csv", function(d) { crimeData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "FIPS_CountyName.csv", function(d) { countyName.set(d.FIPS, d.Name)})
  .await(ready);

function ready(error, us) {
  if (error) throw error;

  map = us;
  drawMap();
}

function drawMap() {
  svg.selectAll("*").remove();
  svg.attr("width", width)
     .attr("height", height)
     .append("g");

  g = svg.append("g");

  svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)

  svg.call(zoom)
     .call(zoom.event);
  
  
  g
   .attr("class", "counties")
   .selectAll("path")
    .data(topojson.feature(map, map.objects.counties).features)
   .enter().append("path")
    .attr("class", function(d) { return quantize(rateById.get(d.id)); })
    .attr("d", path)


  g.append("path")
    .datum(topojson.mesh(map, map.objects.states, function(a, b) {return a !== b;}))
    .attr("class", "states")
    .attr("d", path);
}

function sizeChange() {
  //d3.select("g").attr("transform", "scale(" + $("#map-content-wrapper").width()/960 + ")");
  //   $("svg").height($("#map-content-wrapper").width()*0.618);

}

function zoomed() {
  projection
      .translate(zoom.translate())
      .scale(zoom.scale());

  g.selectAll("path")
      .attr("d", path);
}

function updateMap() {
  // Figure out a better method
  var numOfLevels = weights.length -1;
  if (!weights[numOfLevels][0].isButton) numOfLevels = numOfLevels + 1; 

  var temp = d3.map();
  for (var i=0; i<weights.length; i++)
  {
    var level = d3.map();
    var levelSize = weights[i].length;
    if (weights[i][0].isButton)
    {
      break;
    }
    for (var j=0; j<weights[i].length; j++)
    {
      // Welcome to the if stack from hell. 
      if ("Crime".localeCompare(weights[i][j].label) == 0)
      {
        if (level.empty())
        {
          level = crimeData;
        }
        else
        { 
          var crimeValues = crimeData.entries();
          for (k = 0; k < crimeValues.length; k++)
          {
            level.set(crimeValues[k].key, (level.get(crimeValues[k].key) + crimeValues[k].value));
          }
        }
      } else {
        if ("Cost of Living".localeCompare(weights[i][j].label) == 0)
        {
          if (level.empty())
          {
            level = costData;
          }
          else
          {
            var costValues = costData.entries();
            for (k = 0; k < costValues.length; k++)
            {
              level.set(costValues[k].key, (level.get(costValues[k].key) + costValues[k].value));
            }
          }
        } else 
        {
          if ("Education".localeCompare(weights[i][j].label) == 0)
          {
            if (level.empty())
            {
              level = educationData;
            }
            else
            {
              var educationValues = educationData.entries();
              for (k = 0; k < educationValues.length; k++)
              {
                level.set(educationValues[k].key, (level.get(educationValues[k].key) + educationValues[k].value));
              }
            }
          } else {
            if ("Unemployment".localeCompare(weights[i][j].label) == 0)
            {
              if (level.empty())
              {
                level = unemploymentData;
              }
              else
              {
                var unemploymentValues = unemploymentData.entries();
                for (k = 0; k < unemploymentValues.length; k++)
                {
                  level.set(unemploymentValues[k].key, (level.get(unemploymentValues[k].key) + unemploymentValues[k].value));
                }
              }
            } else {
              if ("Income".localeCompare(weights[i][j].label) == 0)
              {
                if (level.empty())
                {
                  level = incomeData;
                }
                else
                {
                  var incomeValues = incomeData.entries();
                  for (k = 0; k < incomeValues.length; k++)
                  {
                    level.set(incomeValues[k].key, (level.get(incomeValues[k].key) + incomeValues[k].value));
                  }
                }
              } else {
                if ("Commute Time".localeCompare(weights[i][j].label) == 0)
                {
                  if (level.empty())
                  {
                    level = commuteData;
                  }
                  else
                  {
                    var commuteValues = commuteData.entries();
                    for (k = 0; k < commuteValues.length; k++)
                    {
                      level.set(commuteValues[k].key, (level.get(commuteValues[k].key) + commuteValues[k].value));
                    }
                  }
                } else {
                  if ("Health".localeCompare(weights[i][j].label) == 0)
                  {
                    if (level.empty())
                    {
                      level = healthData;
                    }
                    else
                    {
                      var healthValues = healthData.entries();
                      for (k = 0; k < healthValues.length; k++)
                      {
                        level.set(healthValues[k].key, (level.get(healthValues[k].key) + healthValues[k].value));
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    var levelE = level.entries();
    for (var e = 0; e<levelE.length; e++)
    {
      var en = levelE[e];
      var v = (en.value/levelSize);
      if (numOfLevels > 1)
      {
        v = v*(1/Math.pow(2, i+1)) 
      }
      if (temp.has(en.key))
      {
        v = temp.get(en.key) + v;
      }
      temp.set(en.key, v);
    }
  }

  var tempE = temp.entries();
  var maxV = d3.max(temp.values());
  var minV = d3.min(temp.values());
  var valueScale = d3.scale.linear().domain([minV,maxV]).range([1,100]);
  for (var t =0; t < tempE.length; t++)
  {
    var tp = tempE[t];
    rateById.set(tp.key, valueScale(tp.value));
  }

  drawMap();
}


d3.select(self.frameElement).style("height", height + "px");

