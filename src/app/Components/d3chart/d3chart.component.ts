import {Component, OnInit, ElementRef, ViewEncapsulation} from '@angular/core';
import {D3Service, D3, } from 'd3-ng2-service';
import * as _ from 'underscore';
import {DataSharingService} from "../../Services/data/data-sharing.service";
import {Router} from "@angular/router";
@Component({
  selector: 'app-barchart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'd3chart.component.html',
  styleUrls: ['d3chart.component.css']
})
export class D3ChartComponent implements OnInit {

  private d3: D3; // <-- Define the private member which will hold the d3 reference
  private parentNativeElement: any;
  private finalData=[];
  private keywords=[];
  private sentiKeys =[];
  totalReviews: number =0;
  negativeReviews: number =0;
  positiveReviews: number =0;
  private containerWidth: number;
  constructor(element: ElementRef, d3Service: D3Service,private dataService:DataSharingService,private router:Router) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;

  }


  ngOnInit(): void {
    this.containerWidth = this.parentNativeElement.getBoundingClientRect().width;
    this.getData();
  }
  getData(){
    const  self = this;
    if(_.keys(self.dataService.sharedData).length === 0)
      self.router.navigateByUrl('');
    else {
      self.finalData = self.dataService.sharedData["finalData"];
      self.keywords = self.dataService.sharedData["keywords"];
      self.sentiKeys = self.dataService.sharedData["sentiKeys"];
      self.totalReviews = self.dataService.sharedData["totalReviews"];
      self.positiveReviews = self.dataService.sharedData["positiveReviews"];
      self.negativeReviews = self.dataService.sharedData["negativeReviews"];
      self.createChart();
    }
  }
  createChart() {
    let self = this;
    let svg = self.d3.select("svg").attr("width",self.containerWidth).attr("height","600"),
      margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x0 = self.d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.1);

    let x1 = self.d3.scaleBand()
      .padding(0.05);

    let y = self.d3.scaleLinear()
      .range([height, 0]);

    let z = self.d3.scaleOrdinal()
      .range(["#ff6666","#4682b4"]);

    let div = self.d3.select("app-barchart").append("div")
      .attr("class", "barTooltip");
    x0.domain(self.keywords.map(function (d) {
        return d;
    }));
    x1.domain(self.sentiKeys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, self.d3.max(self.finalData, function (d) {
      return self.d3.max(self.sentiKeys, function (key) {
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
        return self.sentiKeys.map(function (key) {
          return {key: key, value: d[key]};
        });
      })
      .enter().append("rect")
      .attr("onmouseover","evt.target.setAttribute('opacity', '0.5');")
      .attr("onmouseout","evt.target.setAttribute('opacity', '1');")
      .on('mousemove',function(d){
        div.html("<p>"+((d.key === "positiveCount")?"Positive":"Negative") +" : "+d.value+"</p>")
          .style("left",(self.d3.event.pageX -150) + "px")
          .style("top",(self.d3.event.pageY - 220) + "px");
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

    let legend = g.append("g")
      .attr("style", "outline: thin solid #ddd;")
      .style("font-family", "sans-serif")
      .style("font-size", 10)
      .attr("text-anchor", "end")
      .attr("transform","translate(0,130)")
      .selectAll("g")
      .data(self.sentiKeys.slice())
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
  }
  getMax(d,z){
    return z(d.key);

  }
  fillLegend(z){
    return z;
  }
}
