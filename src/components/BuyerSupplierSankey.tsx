import React, { useMemo, useRef, useEffect, useState } from 'react';
import { sankey as d3sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';
import * as d3 from 'd3';
import { Supplier, Buyer } from '../types';

interface SankeyNodeType extends SankeyNode<{ name: string; type: 'supplier' | 'buyer'; id: string }, object> {
  name: string;
  type: 'supplier' | 'buyer';
  id: string;
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}
interface SankeyLinkType extends SankeyLink<{ name: string; type: 'supplier' | 'buyer'; id: string }, object> {
  source: number | SankeyNodeType;
  target: number | SankeyNodeType;
  value: number;
  fruit: string[];
}

interface BuyerSupplierSankeyProps {
  suppliers: Supplier[];
  buyers: Buyer[];
  width?: number;
  height?: number;
}

export const BuyerSupplierSankey: React.FC<BuyerSupplierSankeyProps> = ({ suppliers, buyers, width = 900, height = 400 }) => {
  // Build nodes and links
  const { nodes, links } = useMemo(() => {
    const supplierNodes: SankeyNodeType[] = suppliers.map((s) => ({
      name: s.name,
      type: 'supplier',
      id: `${s.id}_supplier`,
    }));
    const buyerNodes: SankeyNodeType[] = buyers.map((b) => ({
      name: b.name,
      type: 'buyer',
      id: `${b.id}_buyer`,
    }));
    const allNodes: SankeyNodeType[] = [...supplierNodes, ...buyerNodes];
    // Build a map from node ID to index
    const nodeIdToIndex = new Map<string, number>();
    allNodes.forEach((n, idx) => nodeIdToIndex.set(n.id, idx));
    const links: SankeyLinkType[] = [];
    for (const buyer of buyers) {
      for (const supplier of suppliers) {
        const sharedFruits = buyer.fruitsInterested.filter(fruit => supplier.fruitsOffered.includes(fruit));
        if (sharedFruits.length > 0) {
          const sourceIdx = nodeIdToIndex.get(`${supplier.id}_supplier`);
          const targetIdx = nodeIdToIndex.get(`${buyer.id}_buyer`);
          if (sourceIdx === undefined || targetIdx === undefined) continue;
          links.push({
            source: sourceIdx,
            target: targetIdx,
            value: sharedFruits.length,
            fruit: sharedFruits,
          } as SankeyLinkType);
        }
      }
    }
    return { nodes: allNodes, links };
  }, [suppliers, buyers]);

  // Error state for circular link
  const [sankeyError, setSankeyError] = useState<string | null>(null);

  // Sankey layout
  const sankeyData = useMemo(() => {
    const sankeyGen = d3sankey<{ name: string; type: 'supplier' | 'buyer'; id: string }, object>()
      .nodeWidth(24)
      .nodePadding(24)
      .extent([[0, 0], [width, height]]);
    try {
      // Only allow links from suppliers to buyers
      const filteredLinks = links.filter(l => {
        const sourceNode = nodes[l.source as number];
        const targetNode = nodes[l.target as number];
        return sourceNode.type === 'supplier' && targetNode.type === 'buyer';
      });
      setSankeyError(null);
      return sankeyGen({ nodes: nodes.map(n => ({ ...n })), links: filteredLinks.map(l => ({ ...l })) });
    } catch (e: unknown) {
      let msg = 'Error rendering Sankey diagram.';
      function hasMessage(err: unknown): err is { message: string } {
        return typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string';
      }
      if (hasMessage(e)) {
        msg = e.message;
      }
      setSankeyError(msg);
      return { nodes: [], links: [] };
    }
  }, [nodes, links, width, height]);

  // Colors
  const supplierColor = '#60a5fa';
  const buyerColor = '#fbbf24';
  const linkColor = d3.scaleOrdinal(d3.schemeCategory10);

  // Responsive
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width);
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      setContainerWidth(containerRef.current?.offsetWidth || width);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  // Tooltip
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  return (
    <div ref={containerRef} className="w-full mt-12">
      <h3 className="text-xl font-bold mb-4 text-center">Potential Buyer-Supplier Connection Map</h3>
      {sankeyError ? (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4 text-center mb-6">
          {sankeyError}
        </div>
      ) : sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? (
        <svg width={containerWidth} height={height} style={{ background: '#f9fafb', borderRadius: 16, boxShadow: '0 2px 8px #0001' }}>
          {/* Links */}
          <g>
            {sankeyData.links.map((link, i) => {
              if (!('fruit' in link)) return null;
              const typedLink = link as SankeyLinkType;
              const path = sankeyLinkHorizontal()(typedLink);
              return (
                <path
                  key={i}
                  d={path || undefined}
                  fill="none"
                  stroke={linkColor(i.toString())}
                  strokeOpacity={0.35 + 0.5 * (typedLink.value / 5)}
                  strokeWidth={Math.max(1, typedLink.width || 1)}
                  onMouseMove={e => {
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      content: `${(typedLink.source as SankeyNodeType).name} → ${(typedLink.target as SankeyNodeType).name}\nShared fruits: ${(typedLink.fruit || []).join(', ')}`
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ transition: 'stroke-opacity 0.2s' }}
                />
              );
            })}
          </g>
          {/* Nodes */}
          <g>
            {sankeyData.nodes.map((node: SankeyNodeType, i: number) => {
              if (
                typeof node.x0 !== 'number' ||
                typeof node.x1 !== 'number' ||
                typeof node.y0 !== 'number' ||
                typeof node.y1 !== 'number'
              ) {
                return null;
              }
              // Improved label position: suppliers inside left, buyers outside right
              let x, anchor;
              if (node.type === 'supplier') {
                x = node.x0 + 6; // inside left edge, with padding
                anchor = 'start';
              } else {
                x = node.x1 + 8; // outside right edge
                anchor = 'start';
              }
              const y = ((node.y0 + node.y1) / 2);
              return (
                <g key={i}>
                  <rect
                    x={node.x0}
                    y={node.y0}
                    width={node.x1 - node.x0}
                    height={node.y1 - node.y0}
                    fill={node.type === 'supplier' ? supplierColor : buyerColor}
                    rx={6}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{ filter: 'drop-shadow(0 1px 2px #0001)' }}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    alignmentBaseline="middle"
                    fontSize={13}
                    fontWeight={600}
                    fill="#222"
                    pointerEvents="none"
                    style={{
                      userSelect: 'none',
                      paintOrder: 'stroke',
                      stroke: '#fff',
                      strokeWidth: 3,
                      strokeLinejoin: 'round',
                    }}
                  >
                    {node.name}
                  </text>
                  <text
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    alignmentBaseline="middle"
                    fontSize={13}
                    fontWeight={600}
                    fill="#222"
                    pointerEvents="none"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      ) : (
        <div className="text-gray-500 bg-gray-50 border border-gray-200 rounded p-4 text-center mb-6">
          No buyer-supplier connections to display.
        </div>
      )}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 2px 8px #0002',
            padding: '8px 14px',
            fontSize: 14,
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'pre-line',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}; 