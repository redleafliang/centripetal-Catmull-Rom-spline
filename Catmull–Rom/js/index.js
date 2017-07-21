var width = 1000,
    height = 1000,
    margin = {left:50,top:30,right:20,bottom:20},
    g_width = width-margin.left-margin.right,
    g_height = height-margin.top-margin.bottom;

//svg
var svg = d3.select("#container")
    .append("svg")
    //属性：宽、高
    .attr("width",width)
    .attr("height",height)

//g元素
var g = d3.select("svg")
    .append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")")





function CatmullRomSpline(P0, P1, P2, P3) {
    //Calculate t0 to t4
    var alpha = 0.5;

    // console.log(P0);
    // console.log(P1);
    // console.log(P2);
    // console.log(P3);


    function tj(ti, Pi, Pj) {
        //xi, yi = Pi
        var xi = Pi[0];
        var yi = Pi[1];
        //xj, yj = Pj
        var xj = Pj[0];
        var yj = Pj[1];
        //return ( ( (xj-xi)**2 + (yj-yi)**2 )**0.5 )**alpha + ti
        return Math.pow( Math.pow( (Math.pow((xj-xi),2) + Math.pow((yj-yi),2)), 0.5) , alpha)+ ti ;
    }

    var t0 = 0;
    var t1 = tj(t0, P0, P1);
    var t2 = tj(t1, P1, P2);
    var t3 = tj(t2, P2, P3);

    // console.log(t1);
    // console.log(t2);
    // console.log(t3);

    var newPoints = [];


    for(var t=t1; t<t2; t+=((t2-t1)/10))
    {
        //var A1 = (t1-t)/(t1-t0)*P0 + (t-t0)/(t1-t0)*P1;
        var A1 = [];
        A1[0] = (t1-t)/(t1-t0)* P0[0] + (t-t0)/(t1-t0)* P1[0];
        A1[1] = (t1-t)/(t1-t0)* P0[1] + (t-t0)/(t1-t0)* P1[1];

        //var A2 = (t2-t)/(t2-t1)* P1 + (t-t1)/(t2-t1)*P2;
        var A2 = [];
        A2[0] = (t2-t)/(t2-t1)* P1[0] + (t-t1)/(t2-t1)* P2[0];
        A2[1] = (t2-t)/(t2-t1)* P1[1] + (t-t1)/(t2-t1)* P2[1];

        //var A3 = (t3-t)/(t3-t2)* P2 + (t-t2)/(t3-t2)*P3;
        var A3 = [];
        A3[0] = (t3-t)/(t3-t2)* P2[0] + (t-t2)/(t3-t2)* P3[0];
        A3[1] = (t3-t)/(t3-t2)* P2[1] + (t-t2)/(t3-t2)* P3[1];

        //var B1 = (t2-t)/(t2-t0)* A1 + (t-t0)/(t2-t0)*A2;
        var B1 = [];
        B1[0] = (t2-t)/(t2-t0)* A1[0] + (t-t0)/(t2-t0)* A2[0];
        B1[1] = (t2-t)/(t2-t0)* A1[1] + (t-t0)/(t2-t0)* A2[1];

        //var B2 = (t3-t)/(t3-t1)* A2 + (t-t1)/(t3-t1)*A3;
        var B2 = [];
        B2[0] = (t3-t)/(t3-t1)* A2[0] + (t-t1)/(t3-t1)* A3[0];
        B2[1] = (t3-t)/(t3-t1)* A2[1] + (t-t1)/(t3-t1)* A3[1];

        //var C = (t2-t)/(t2-t1)* B1 + (t-t1)/(t2-t1)*B2;
        var C = [];
        C[0] = (t2-t)/(t2-t1)* B1[0] + (t-t1)/(t2-t1)* B2[0];
        C[1] = (t2-t)/(t2-t1)* B1[1] + (t-t1)/(t2-t1)* B2[1];

        newPoints.push(C);
        //console.log(C);
    }
    //console.log(newPoints);
    return newPoints;

}

function CatmullRomChain(P) {

    //Calculate Catmull Rom for a chain of points and return the combined curve.

    var sz = P.length;

    // The curve C will contain an array of (x,y) points.
    var C = [];
    for (var i = 0; i<sz-3 ; i++) {
        //console.log();
        var c = CatmullRomSpline(P[i], P[i + 1], P[i + 2], P[i + 3])
        //C + = c;
        for (var j =0; j < c.length; j++) {
            C.push( c[j] );
        }
    }

    return C



}



var nPoints = 100;
var Points = [[0,1.5],[2,2],[3,1],[4,0.5],[5,1],[6,2],[7,3]];

var c = CatmullRomChain(Points);
// console.log(c);

var X_scale = [];
var Y_scale = [];
var C_length = c.length;
for (var i=0; i<C_length; i++){
    X_scale[i] = c[i][0];
    Y_scale[i] = c[i][1];
}
// console.log(X_scale);
// console.log(Y_scale);



var data = c;


//设置比例缩放
var scale_x = d3.scale.linear()
    .domain([0,d3.max(X_scale)]) //输入范围(定义域),横坐标显示有几个数据则为几个数
    .range([0,g_width])
var scale_y = d3.scale.linear()
    .domain([0,d3.max(Y_scale)])
    .range([g_height,0])//输出范围（值域），g_height 表示的是当数据为最大值即“8”的时候，输出最高点为g_height。这里要注意由于浏览器从左到右、从上到下的坐标系数值是逐渐增到，因此我们将range的值设成[g_height，0]即可实现整一个的翻转

//绘制曲线
var line_generator = d3.svg.line()
    .x(function(d){
        console.log("---");
        console.log("d[0]");
        console.log(d[0]);
        console.log("---");
        return scale_x(d[0]);
    })
    .y(function(d){
        console.log("---");
        console.log("d[1]");
        console.log(d[1]);
        console.log("---");
        return scale_y(d[1]);
    })
    .interpolate("cardinal");

d3.select("g")
    .append("path")
    .attr("d",line_generator(data))




//添加坐标轴函数：axis（）
var x_axis = d3.svg.axis().scale(scale_x),
    y_axis = d3.svg.axis().scale(scale_y).orient("left");

//依次添加X、Y坐标轴,并通过偏移量的设置使得X坐标轴往下移
g.append("g")
    .call(x_axis)
    .attr("transform","translate(0,"+g_height+")")
g.append("g")
    .call(y_axis)
    .append("text")
    .text("Catmull–Rom")
    .attr("transform","rotate(-90)")
    .attr("text-anchor","end")
    .attr("dy","1em")
















