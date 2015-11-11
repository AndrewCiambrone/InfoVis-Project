// Programmed By: Andrew Ciambrone

d3.select(window).on("resize", sizeChange);

var margin = {top: -5, right: -5, bottom: -5, left: -5};
var	width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var rateById = d3.map();

var quantize = d3.scale.quantize().domain([0, 100]).range(d3.range(9).map(function(i) { return "q"+i+"-9"}));

var projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([width/2, height/2]);

var path = d3.geo.path().projection(projection);

var map = null;

var svg = d3.select("#map-content-wrapper").append("svg")
    .attr("width", "100%")

var educationData = d3.map();
var healthData = d3.map();
var incomeData = d3.map();
var crimeData = d3.map();
var costData = d3.map();
var commuteData= d3.map();
var unemploymentData = d3.map();

queue()
  .defer(d3.json, "us.json")
  .defer(d3.csv, "Education_new.csv", function(d) { educationData.set(d.FIPS, parseFloat(d.Score));})
  .defer(d3.csv, "Unemployment_By_County.csv", function(d) { unemploymentData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Commuting_Time_By_County.csv", function(d) { commuteData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Cost_of_Living_By_County.csv", function(d) { costData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Health_new.csv", function(d) { healthData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Income_By_County.csv", function(d) { incomeData.set(d.FIPS, parseFloat(d.Score)); })
  .defer(d3.csv, "Crime_By_County.csv", function(d) { crimeData.set(d.FIPS, parseFloat(d.Score)); })
  .await(ready);

function ready(error, us) {
  if (error) throw error;

  map = us;
  drawMap();
}

function drawMap() {
  svg.selectAll("*").remove();
  svg.attr("width", "100%");
  
  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(map, map.objects.counties).features)
    .enter().append("path")
      .attr("class", function(d) { return quantize(rateById.get(d.id)); })
      .attr("d", path);
  sizeChange();
  svg.append("path")
    .datum(topojson.mesh(map, map.objects.states, function(a, b) {return a !== b;}))
    .attr("class", "states")
    .attr("d", path);
}

function sizeChange() {
  d3.select("g").attr("transform", "scale(" + $("#map-content-wrapper").width()/900 + ")");
      $("svg").height($("#map-content-wrapper").width()*0.618);
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
          //Verify later. 
          var keys = crimeData.keys();
          var levelValues = level.values();
          var crimeValues = crimeData.values();
          for (k = 0; k < keys.length; k++)
          {
            var id = keys[k];
            level.set(id, levelValues[k] + crimeValues[k]);
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
            var keys = costData.keys();
            var levelValues = level.values();
            var costValues = costData.values();
            for (k = 0; k < keys.length; k++)
            {
              var id = keys[k];
              level.set(id, levelValues[k] + costValues[k]);
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
              var keys = educationData.keys();
              var levelValues = level.values();
              var educationValues = educationData.values();
              for (k = 0; k < keys.length; k++)
              {
                var id = keys[k];
                level.set(id, levelValues[k] + educationValues[k]);
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
                var keys = unemploymentData.keys();
                var levelValues = level.values();
                var unemploymentValues = unemploymentData.values();
                for (k = 0; k < keys.length; k++)
                {
                  var id = keys[k];
                  level.set(id, levelValues[k] + unemploymentValues[k]);
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
                  var keys = commuteData.keys();
                  var levelValues = level.values();
                  var incomeValues = incomeData.values();
                  for (k = 0; k < keys.length; k++)
                  {
                    var id = keys[k];
                    level.set(id, levelValues[k] + incomeValues[k]);
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
                    var keys = commuteData.keys();
                    var levelValues = level.values();
                    var commuteValues = commuteData.values();
                    for (k = 0; k < keys.length; k++)
                    {
                      var id = keys[k];
                      level.set(id, levelValues[k] + commuteValues[k]);
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
                      var keys = healthData.keys();
                      var levelValues = level.values();
                      var healthValues = healthData.values();
                      for (k = 0; k < keys.length; k++)
                      {
                        var id = keys[k];
                        level.set(id, levelValues[k] + healthValues[k]);
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
        v = v*(1/Math.pow(2, i)) 
      }
      if (temp.has(en.key))
      {
        v = temp.get(en.key) + v;
      }
      temp.set(en.key, v);
    }
  }

  var tempE = temp.entries();
  for (var t =0; t < tempE.length; t++)
  {
    var tp = tempE[t];
    rateById.set(tp.key, tp.value/numOfLevels);
  }

  //rateById = temp;
  drawMap();
}
