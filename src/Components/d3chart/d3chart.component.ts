import {Component, OnInit, ElementRef, ViewEncapsulation} from '@angular/core';
import {D3Service, D3, Selection} from 'd3-ng2-service';
import {SentimentAnalysisService} from "../../service/sentiment-service/sentiment-analysis.service";
@Component({
  selector: 'app-barchart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'd3chart.component.html',
  styleUrls: ['d3chart.component.css']
})
export class D3ChartComponent implements OnInit {
  private d3: D3; // <-- Define the private member which will hold the d3 reference
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
  private sentiObject={};
  private finalData=[];
  private keywords=[];
  private positiveCounts= [];
  private negativeCounts= [];

  constructor(element: ElementRef, d3Service: D3Service,private sentimentService:SentimentAnalysisService) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;

  }


  ngOnInit(): void {
    this.createChart();
  }
  createChart() {
    let self = this;
    var filteredKeywords = [];
    this.sentimentService.getKeyConcerns().then(keywordsArray =>{
      keywordsArray.map(function (word) {
        self.sentiObject[word] = {negativeCount: 0, positiveCount: 0};
        self.keywords.push(word);
      });
    });
    this.sentimentService.getSentimentData().then((data)=>{
      data.map(function (obj) {
        obj.keyPhrases.map(function (phrase) {
          if (obj.sentiment === "Negative")
            self.sentiObject[phrase].negativeCount++;
          if (obj.sentiment === "Positive")
            self.sentiObject[phrase].positiveCount++;
        });
      });
      self.keywords.sort();
      self.keywords.map(function (j) {
        if(self.sentiObject[j].negativeCount === 0 && self.sentiObject[j].positiveCount === 0) {
          return ;
        }
        else {
          self.positiveCounts.push(self.sentiObject[j].positiveCount);
          self.negativeCounts.push(self.sentiObject[j].negativeCount);
          filteredKeywords.push(j);
        }
      });
      self.keywords.map(function (p) {
        if(self.sentiObject[p].negativeCount === 0 && self.sentiObject[p].positiveCount === 0) {
          return ;
        }
        else
          self.finalData.push({
              name: p,
              negativeCount: self.sentiObject[p].negativeCount,
              positiveCount: self.sentiObject[p].positiveCount
            });

      });

      var sentiKeys = Object.keys(self.finalData[0]).slice(1);

      var svg = self.d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x0 = self.d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

      var x1 = self.d3.scaleBand()
        .padding(0.05);

      var y = self.d3.scaleLinear()
        .range([height, 0]);

      var z = self.d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

      var div = self.d3.select("app-barchart").append("div")
        .attr("class", "tooltip");
      x0.domain(self.keywords.map(function (d) {
        if(self.sentiObject[d].negativeCount === 0 && self.sentiObject[d].positiveCount === 0) {
          return ;
        }
        else
          return d;
      }));
      x1.domain(sentiKeys).rangeRound([0, x0.bandwidth()]);
      y.domain([0, self.d3.max(self.finalData, function (d) {
        return self.d3.max(sentiKeys, function (key) {
          return d[key];
        });
      })]).nice();
      g.append("g")
        .selectAll("g")
        .data(self.finalData)
        .enter().append("g")
        .attr("transform", function (d) {
          return "translate(" + x0(d.name) + ",0)";
        })
        .selectAll("rect")
        .data(function (d) {
          return sentiKeys.map(function (key) {
            return {key: key, value: d[key]};
          });
        })
        .enter().append("rect")
        .attr("onmouseover","evt.target.setAttribute('opacity', '0.5');")
        .attr("onmouseout","evt.target.setAttribute('opacity', '1');")
        .on('mousemove',function(d){
          div.html("<p>"+d.key +" : "+d.value+"</p>")
            .attr("class","tooltip")
            .style("position"," absolute")
            .style("text-align","center")
            .style("width","100px")
            .style("height","12px")
            .style("font","10px sans-serif")
            .style("font-weight","bold")
            //.style("background","#ddd")
            .style("pointer-events","none")
            .style("left",(self.d3.event.pageX -95 ) + "px")
            .style("top",(self.d3.event.pageY ) + "px");
       })
        .on('mouseover',function(){
          div.style("display", "inline");
        })
        .on('mouseout',function(){
          div.style("display", "none");
        })
        .attr("x", function (d) {
          return x1(d.key);
        })
        .attr("y", function (d) {
          return y(d.value);
        })
        .attr("width", x1.bandwidth())
        .attr("height", function (d) {
          return height - y(d.value);
        })
        .attr("fill",d=> self.getMax(d,z));

      g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(self.d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-20)");


      g.append("g")
        .attr("class", "axis")
        .call(self.d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", -288)
        .attr("y", y(y.ticks().pop()) +(8.5))
        .attr("dy", "0.32em")
        .attr("fill", "#00d")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Number of Reviews")
        .attr("transform","rotate(270)");

      var legend = g.append("g")
        .attr("style", "outline: thin solid #ddd;")
        .style("font-family", "sans-serif")
        .style("font-size", 10)
        .attr("text-anchor", "end")
        .attr("transform","translate(-100,30)")
        .selectAll("g")
        .data(sentiKeys.slice())
        .enter().append("g")
        .attr("transform", function (d, i) {
          return "translate(0," + i * 20 + ")";
        });

      legend.append("rect")
        .attr("x", width - 69)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", self.fillLegend(z));

      legend
        .data(["Negative Reviews","Positive Reviews"])
        .append("text")
        .attr("x", width - 74)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) {
          return d;
        });
   });
  }
  getMax(d,z){
    return z(d.key);

  }
  fillLegend(z){
    return z;
  }
}
