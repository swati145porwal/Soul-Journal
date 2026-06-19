import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { EMOTION_WHEEL_DATA } from '../constants';
import { EmotionNode } from '../types';
import { ChevronLeft } from 'lucide-react';

interface SunburstWheelProps {
  onSelectEmotion: (emotion: string, parentCategory: string) => void;
  selectedEmotion: string | null;
}

const SunburstWheel: React.FC<SunburstWheelProps> = ({ onSelectEmotion, selectedEmotion }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const hierarchyRef = useRef<d3.HierarchyNode<EmotionNode>>(
    d3.hierarchy<EmotionNode>(EMOTION_WHEEL_DATA).sum(d => d.children ? 0 : 1)
  );
  
  const [focusNode, setFocusNode] = useState<d3.HierarchyNode<EmotionNode>>(hierarchyRef.current);

  const onSelectRef = useRef(onSelectEmotion);
  useEffect(() => { onSelectRef.current = onSelectEmotion; }, [onSelectEmotion]);

  // Tactile feedback helper
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Slightly reduced max size to ensure fitting with buttons
        const size = Math.min(width, height, 450) || 320;
        setDimensions({ width: size, height: size });
      }
    };
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
    resizeObserver.observe(containerRef.current);
    updateDimensions();
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const radius = width / 2;
    const innerRadius = radius * 0.45; 
    const outerRadius = radius - 10;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [-(width / 2), -(height / 2), width, height])
      .style("width", "100%")
      .style("height", "100%");

    let mainGroup = svg.select<SVGGElement>("g.main-content");
    if (mainGroup.empty()) {
      mainGroup = svg.append("g").attr("class", "main-content");
    }

    const children = focusNode.children || [];
    if (children.length === 0) return;

    const pie = d3.pie<d3.HierarchyNode<EmotionNode>>()
      .value(() => 1) 
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<d3.HierarchyNode<EmotionNode>>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .padAngle(0.015)
      .cornerRadius(12);

    const getColor = (d: d3.HierarchyNode<EmotionNode>) => {
      let current = d;
      while (current.depth > 1 && current.parent) current = current.parent;
      const baseColor = current.data.color || "#e2e8f0";
      const c = d3.color(baseColor);
      if (!c) return baseColor;
      const depthOffset = d.depth - focusNode.depth;
      return c.brighter(depthOffset * 0.5).toString();
    };

    const pieData = pie(children);

    const slices = mainGroup.selectAll<SVGGElement, d3.PieArcDatum<d3.HierarchyNode<EmotionNode>>>("g.slice")
      .data(pieData, d => d.data.data.name);

    const t = svg.transition().duration(750).ease(d3.easeCubicInOut);

    slices.exit()
      .transition(t)
      .style("opacity", 0)
      .remove();

    const slicesEnter = slices.enter()
      .append("g")
      .attr("class", "slice")
      .style("cursor", "pointer")
      .style("opacity", 0)
      .on("click", (event, d) => {
        triggerHaptic();
        if (d.data.data.children && d.data.data.children.length > 0) {
          setFocusNode(d.data);
        } else {
          let rootCat = d.data;
          while (rootCat.depth > 1 && rootCat.parent) rootCat = rootCat.parent;
          onSelectRef.current(d.data.data.name, rootCat.data.name);
        }
      });

    slicesEnter.append("path")
      .attr("stroke", "#FFFDF5")
      .attr("stroke-width", 2)
      .style("transition", "filter 0.3s ease");

    slicesEnter.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "#000000")
      .style("font-weight", "900")
      .style("pointer-events", "none")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.02em");

    const slicesMerged = slicesEnter.merge(slices);

    slicesMerged.transition(t)
      .style("opacity", 1);

    slicesMerged.select("path")
      .transition(t)
      .attr("d", arc)
      .attr("fill", d => getColor(d.data));

    slicesMerged.select("text")
      .transition(t)
      .style("font-size", children.length > 7 ? "9px" : "11px")
      .attr("transform", d => {
        const [x, y] = arc.centroid(d);
        const angle = (d.startAngle + d.endAngle) / 2;
        let rotate = (angle * 180 / Math.PI) - 90;
        if (angle > Math.PI + 0.01 && angle < 2 * Math.PI - 0.01) {
            rotate += 180;
        }
        return `translate(${x},${y}) rotate(${rotate})`;
      })
      .text(d => d.data.data.name);

    if (svg.select("circle.center-bg").empty()) {
      svg.append("circle")
        .attr("class", "center-bg")
        .attr("r", innerRadius - 4)
        .attr("fill", "white")
        .style("filter", "drop-shadow(0 4px 12px rgba(0,0,0,0.06))")
        .lower();
    } else {
      svg.select("circle.center-bg")
        .transition(t)
        .attr("r", innerRadius - 4);
    }

  }, [dimensions, focusNode]);

  return (
    <div ref={containerRef} className="flex justify-center items-center w-full h-full min-h-[360px] relative wheel-container animate-in fade-in zoom-in-95 duration-700">
      <svg ref={svgRef} className="overflow-visible" />
      
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center justify-center z-10"
        style={{ width: dimensions.width * 0.42, height: dimensions.width * 0.42 }}
      >
        <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-full">
            <span className="text-[10px] text-brand-primary font-black uppercase tracking-[0.4em]">
              {focusNode.depth === 0 ? "Identify" : "Category"}
            </span>
            <div className="text-brand-dark font-black text-sm sm:text-base uppercase leading-tight px-1 max-w-[120px] break-words line-clamp-2">
              {focusNode.data.name}
            </div>
            
            {focusNode.parent && (
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic();
                      setFocusNode(focusNode.parent!);
                  }}
                  className="pointer-events-auto mt-4 px-6 py-2 bg-brand-primary text-white border-2 border-white rounded-full flex items-center gap-2 font-black text-[10px] hover:bg-brand-secondary transition-all shadow-xl active:scale-90"
                >
                  <ChevronLeft size={14} strokeWidth={4} /> BACK
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SunburstWheel;