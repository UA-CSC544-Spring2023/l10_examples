////////////////////////////////////////////////////////////////
//
// This javascript example shows many examples of how to make color
// scales using d3.  It also shows how to build a simple color legend.
//
// To experiment, you will want to change the definition of the variable
// `colorScale', as defined on line 151
//
// Author: Joshua Levine
// Date: February 15, 2023
//
////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////
// Setup

// Add the svg element
let svg = d3.select("#div1").append("svg")

// Initialize width/height
svg.attr("width", 500)
  .attr("height", 500)


//input dataset of 20 random integers
let dataset = [-36, -36, 0, -34, 0, -7, 16, -20, 19, 34, 8, -39, 45, -12, 7, -34, -11, 44, 8, -44];
let [dMin, dMax] = d3.extent(dataset)

let cxScale = d3.scaleLinear().domain([0,20]).range([80,480])
let cyScale = d3.scaleLinear().domain([dMin,dMax]).range([470,70])



////////////////////////////////////////////////////////////////
// Some basic scales

//linear scale
let colorScale1 = d3.scaleLinear()
                    .domain([dMin,dMax])
                    .range(["purple","orange"])

//create a diverging color scale by using 3 values instead of 2
let colorScale2 = d3.scaleLinear()
                    .domain([dMin,0,dMax])
                    .range(["purple","white","orange"])

//quantizing removes the color interpolation and thresholds to the
//nearest color in the range.
//Note that quantized scales only have a min/max, but can have as many entries
//in range as you like
let colorScale2b = d3.scaleQuantize()
                    .domain([dMin,dMax])
                    .range(["purple","white","orange"])

//change the interpolator, see https://blocks.roadtolarissa.com/mbostock/3014589
let colorScale3 = d3.scaleLinear()
                    .domain([dMin,dMax])
                    .range(["purple","orange"])
                    .interpolate(d3.interpolateHcl)


////////////////////////////////////////////////////////////////
// More advanced interpolation of scales

//We can specify colors in scales with any d3 color function, e.g.
//d3.rgb(), d3.lab(), d3.hcl(), etc.
//See https://blocks.roadtolarissa.com/mbostock/9f37cc207c0cb166921b
//for Lab colors.  BUT, this will interpolate in RGB space by default  =( 
let colorScale4 = d3.scaleLinear()
                    .domain([dMin,dMax])
                    .range([d3.lab(50,-100,0),d3.lab(80,100,0)])

//To fix, we specify interpolation using Lab space instead.  
let colorScale4b = d3.scaleLinear()
                    .domain([dMin,dMax])
                    .range([d3.lab(50,-100,0),d3.lab(80,100,0)])
                    .interpolate(d3.interpolateLab)

//Alternatively, if you want some fine grained control, you can build
//scales for each of the separate color channels and then specify the
//color later
let lScale = d3.scaleLinear()
                   .domain([dMin,dMax])
                   .range([50,80])

let aScale = d3.scaleLinear()
                   .domain([dMin,dMax])
                   .range([-100,100])

//Scales are just functions with some extra attributes, so 
//one can always sub in a function for a scale.  In this case, 
//the function helps us call the scales for the individual channels
//separately
function colorScale4c(d) {
  return d3.lab(lScale(d),aScale(d),0);
}


////////////////////////////////////////////////////////////////
// Some of d3's built in color scales (d3.interpolateXXXX)

//These can be accessed with d3.interpolateXXXX using d3.scaleSequential
//See: https://observablehq.com/@d3/sequential-scales?collection=@d3/d3-scale-chromatic
//Also see: https://observablehq.com/@d3/color-schemes?collection=@d3/d3-scale-chromatic for a full list.
let colorScale5 = d3.scaleSequential(d3.interpolateCool)
                    .domain([dMin,dMax])

//d3.interpolateXXXX is just a special function that maps [0,1] to a color
//We can manually recreate this with a map from the data domain to the
//range [0,1] and directly calling the function...but why!
let scaleToUnit = d3.scaleLinear()
                    .domain([dMin,dMax])
                    .range([0,1])

function colorScale5b(d) {
  return d3.interpolateCool(scaleToUnit(d));
}


////////////////////////////////////////////////////////////////
// Some of d3's built in color schemes (d3.schemeXXXX)

//For categorical and discrete scales, d3.scaleQuantize is helpful
//You can access them with d3.schemeXXXX which returns a list of colors
//Some of these are arrays of arrays (like d3.schemePuOr), where you
//have to specify how many colors you want, others are just a fixed list
//(like d3.schemePaired)
function colorScale6(d) {
  let colorScale = d3.scaleQuantize(d3.schemePuOr[4])
    .domain([dMin,dMax])

  return colorScale(d)
}

//See https://github.com/d3/d3-scale-chromatic for many categorical
//schemes
function colorScale7(d) {
  //schemePaired happens to have 12 colors
  let colorScale = d3.scaleQuantize(d3.schemePaired)
    .domain([dMin,dMax])

  return colorScale(d)
}



////////////////////////////////////////////////////////////////
// After selecting which colorScale, let's do the data join and plot
// the dataset as a scatterplot with circles

let colorScale = colorScale2b;           

//Plot dataset as a scatterplot with circles
svg.selectAll("circle")
   .data(dataset)
   .enter()
   .append("circle")
   .attr("cx", (d,i) => cxScale(i))
   .attr("cy", d => cyScale(d))
   .attr("r", 10)
   .attr("fill", d => colorScale(d))

//add some axes
let xAxis = d3.axisBottom().scale(cxScale).ticks(10)
let yAxis = d3.axisLeft().scale(cyScale).ticks(10)

svg.append("g")
   .attr("transform", `translate(0,${cyScale(0)})`)
   .call(xAxis)

svg.append("g")
   .attr("transform", `translate(${cxScale(0)},0)`)
   .call(yAxis)



////////////////////////////////////////////////////////////////
// One can make a color legend by drawing a color ramp as a set of
// rectangles associated with a set of color samples of the scale.  
// See https://observablehq.com/@mbostock/color-ramp

let N = 10
let samples2data = d3.scaleLinear().domain([0,N-1]).range([dMin,dMax])
let colorSamples = d3.range(N).map(d => samples2data(d))
let height = Math.ceil((cyScale.range()[0] - cyScale.range()[1]) / (N-1))

//Together, N and height control the size of the ramp...try increasing N!
//height is calculate to work well when N increases, I've set it to be a small
//number to see the color map more discretely, but at the expense of 
//accuracy

svg.append("g")
  .selectAll("rect")
  .data(colorSamples)
  .enter()
  .append("rect")
  .attr("x", 10)
  .attr("y", d => cyScale(d) - height/2)
  .attr("width", 30)
  .attr("height", height)
  .attr("fill", function(d) {
    return colorScale(d);
  })
  //This line would make the legend appear segmented
  //.attr("stroke", "black")
