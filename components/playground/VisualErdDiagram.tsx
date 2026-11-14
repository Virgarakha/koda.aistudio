"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import {
  Database,
  Key,
  Link2,
  Search,
  Maximize2,
  Minimize2,
  Table2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  Sliders,
  Copy,
  Check,
} from "lucide-react";
import { parseErdFromSql, ErdTable, ErdColumn } from "@/lib/ai/prd-export-helpers";

// ============================================================================
// 1. DAGRE GRAPH AUTO-LAYOUT ENGINE (n8n-style Node Positioning)
// ============================================================================
function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 70,
    ranksep: 110,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    const cols = (node.data as any)?.columns?.length || 4;
    const nodeHeight = 58 + cols * 28;
    const nodeWidth = 300;
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const isHorizontal = direction === "LR";
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const cols = (node.data as any)?.columns?.length || 4;
    const nodeHeight = 58 + cols * 28;
    const nodeWidth = 300;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
}

// ============================================================================
// 2. CUSTOM TABLE NODE COMPONENT (n8n & Prisma Visualizer Inspired)
// ============================================================================
interface TableNodeData {
  tableName: string;
  columns: ErdColumn[];
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onSelectTable?: (name: string) => void;
}

const TableNode = React.memo(({ data, selected }: { data: any; selected?: boolean }) => {
  const { tableName, columns, isHighlighted, isDimmed, onSelectTable } = data as TableNodeData;

  const pkCount = columns.filter((c) => c.isPk).length;
  const fkCount = columns.filter((c) => c.isFk).length;

  return (
    <div
      onClick={() => onSelectTable?.(tableName)}
      className={`rounded-2xl transition-all duration-200 select-none cursor-grab active:cursor-grabbing shadow-2xl min-w-[280px] max-w-[340px] overflow-hidden ${
        selected || isHighlighted
          ? "border-2 border-[#D97757] ring-4 ring-[#D97757]/25 shadow-[0_0_35px_rgba(217,119,87,0.35)] bg-[#19110E]"
          : "border border-[#2D1F1B] bg-[#140E0C] hover:border-[#4A322C] hover:bg-[#18110F]"
      } ${isDimmed ? "opacity-30 scale-95" : "opacity-100 scale-100"}`}
    >
      {/* Node Header */}
      <div className="px-3.5 py-2.5 bg-[#1C1412] border-b border-[#2D1F1B] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center text-[#D97757] shrink-0">
            <Table2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-bold text-[#FAF6F4] truncate">
            {tableName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {pkCount > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {pkCount} PK
            </span>
          )}
          {fkCount > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
              {fkCount} FK
            </span>
          )}
          <span className="text-[10px] font-mono text-[#8D7D77] bg-[#221714] px-1.5 py-0.5 rounded">
            {columns.length}
          </span>
        </div>
      </div>

      {/* Columns list */}
      <div className="py-1 divide-y divide-[#1F1512]">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="px-3 py-1.5 flex items-center justify-between text-xs hover:bg-[#201512] transition-colors relative group"
          >
            {/* Left Handle (Target Handle) */}
            <Handle
              type="target"
              position={Position.Left}
              id={`tgt-${tableName}-${col.name}`}
              className="!w-2.5 !h-2.5 !-left-1.5 !bg-[#D97757] !border-2 !border-[#0E0B0A] hover:!scale-150 transition-transform"
            />

            {/* Column Label */}
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {col.isPk ? (
                <span className="flex items-center gap-0.5 text-[8.5px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  <Key className="w-2.5 h-2.5" />
                  <span>PK</span>
                </span>
              ) : col.isFk ? (
                <span className="flex items-center gap-0.5 text-[8.5px] font-bold px-1 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 shrink-0">
                  <Link2 className="w-2.5 h-2.5" />
                  <span>FK</span>
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D2924] shrink-0" />
              )}

              <span
                className={`font-mono text-[11px] truncate ${
                  col.isPk ? "text-[#FAF6F4] font-bold" : "text-[#D2C3BD]"
                }`}
              >
                {col.name}
              </span>
            </div>

            {/* Type & Reference */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              {col.refTable && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40">
                  &rarr; {col.refTable}
                </span>
              )}
              <span className="font-mono text-[9.5px] text-[#8D7D77]">
                {col.type}
              </span>
            </div>

            {/* Right Handle (Source Handle) */}
            <Handle
              type="source"
              position={Position.Right}
              id={`src-${tableName}-${col.name}`}
              className="!w-2.5 !h-2.5 !-right-1.5 !bg-[#38bdf8] !border-2 !border-[#0E0B0A] hover:!scale-150 transition-transform"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

TableNode.displayName = "TableNode";

const nodeTypes = {
  tableNode: TableNode,
};

// ============================================================================
// 3. INNER REACT FLOW CANVAS WITH CONTROLS
// ============================================================================
interface FlowCanvasProps {
  sql: string;
  tables: ErdTable[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  layoutDirection: "LR" | "TB";
  setLayoutDirection: (d: "LR" | "TB") => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
}

function ErdFlowCanvas({
  sql,
  tables,
  searchQuery,
  setSearchQuery,
  layoutDirection,
  setLayoutDirection,
  isFullscreen,
  setIsFullscreen,
}: FlowCanvasProps) {
  const { fitView } = useReactFlow();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Compute Initial Nodes & Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const rawNodes: Node[] = tables.map((t) => {
      const isQueryMatch =
        searchQuery.trim().length > 0 &&
        (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.columns.some(
            (c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.type.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      const isDimmed = searchQuery.trim().length > 0 && !isQueryMatch;

      return {
        id: `node-${t.name}`,
        type: "tableNode",
        position: { x: 0, y: 0 },
        data: {
          tableName: t.name,
          columns: t.columns,
          isHighlighted: isQueryMatch || selectedTable === t.name,
          isDimmed,
          onSelectTable: (name: string) => {
            setSelectedTable((prev) => (prev === name ? null : name));
          },
        },
      };
    });

    const rawEdges: Edge[] = [];

    tables.forEach((table) => {
      table.columns.forEach((col) => {
        if (col.isFk && col.refTable) {
          const targetTable = tables.find(
            (t) => t.name.toLowerCase() === col.refTable?.toLowerCase()
          );

          if (targetTable) {
            const targetCol = col.refCol || "id";
            const isEdgeHighlighted =
              selectedTable === table.name || selectedTable === col.refTable;

            rawEdges.push({
              id: `edge-${table.name}-${col.name}->${col.refTable}-${targetCol}`,
              source: `node-${table.name}`,
              target: `node-${col.refTable}`,
              sourceHandle: `src-${table.name}-${col.name}`,
              targetHandle: `tgt-${col.refTable}-${targetCol}`,
              type: "smoothstep",
              animated: true,
              style: {
                stroke: isEdgeHighlighted ? "#f59e0b" : "#38bdf8",
                strokeWidth: isEdgeHighlighted ? 2.5 : 1.75,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isEdgeHighlighted ? "#f59e0b" : "#38bdf8",
                width: 14,
                height: 14,
              },
              label: `${col.name} ➔ ${targetCol}`,
              labelStyle: {
                fill: isEdgeHighlighted ? "#fef3c7" : "#bae6fd",
                fontWeight: 600,
                fontSize: 9.5,
                fontFamily: "monospace",
              },
              labelBgStyle: {
                fill: "#0e1726",
                fillOpacity: 0.9,
                stroke: isEdgeHighlighted ? "#f59e0b" : "#0284c7",
                strokeWidth: 1,
                rx: 6,
                ry: 6,
              },
              labelBgPadding: [6, 3] as [number, number],
            });
          }
        }
      });
    });

    // Apply Dagre layout positioning
    return {
      initialNodes: getLayoutedElements(rawNodes, rawEdges, layoutDirection).nodes,
      initialEdges: rawEdges,
    };
  }, [tables, searchQuery, selectedTable, layoutDirection]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state whenever initial elements update
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Re-layout and Fit View trigger
  const handleAutoLayout = useCallback(
    (dir?: "LR" | "TB") => {
      const activeDir = dir || layoutDirection;
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        activeDir
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
      }, 50);
    },
    [nodes, edges, layoutDirection, setNodes, setEdges, fitView]
  );

  const handleCopySql = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0909] relative select-none">
      {/* Top Toolbar (n8n Node Canvas Controls) */}
      <div className="p-3 border-b border-[#111] bg-[#140F0E] flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#111]/20 border border-[#111]/40 flex items-center justify-center">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#FAF6F4]">
              Visual Entity Relationship Diagram (ERD)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#241916] text-[#A89892] border ">
              {tables.length} Tabel · {edges.length} Relasi FK
            </span>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Search Table / Column */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#80868b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tabel / kolom..."
              className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[#332520] bg-[#1A1311] text-[#FAF6F4] placeholder-[#73635D] outline-none w-36 sm:w-44 transition"
            />
          </div>

          {/* Layout Direction Selector (LR vs TB) */}
          <div className="flex items-center bg-[#1A1311] border border-[#332520] rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setLayoutDirection("LR");
                handleAutoLayout("LR");
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                layoutDirection === "LR"
                  ? "bg-[#2A1D19] text-[#FAF6F4] font-semibold"
                  : "text-[#8D7D77] hover:text-white"
              }`}
              title="Tata Letak Horizontal (Kiri ke Kanan seperti n8n)"
            >
              LR
            </button>
            <button
              type="button"
              onClick={() => {
                setLayoutDirection("TB");
                handleAutoLayout("TB");
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                layoutDirection === "TB"
                  ? "bg-[#2A1D19] text-[#FAF6F4] font-semibold"
                  : "text-[#8D7D77] hover:text-white"
              }`}
              title="Tata Letak Vertikal (Atas ke Bawah)"
            >
              TB
            </button>
          </div>

          {/* Auto Layout Button */}
          <button
            type="button"
            onClick={() => handleAutoLayout()}
            className="px-2.5 py-1 rounded-lg bg-[#1A1311] hover:bg-[#251A16] text-[#FAF6F4] hover:text-white border border-[#332520] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Rapikan posisi node dan relasi (Auto-Layout Dagre)"
          >
            <Sparkles className="w-3.5 h-3.5 " />
            <span className="hidden sm:inline">Tata Ulang</span>
          </button>

          {/* Copy SQL */}
          <button
            type="button"
            onClick={handleCopySql}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#1A1311] hover:bg-[#251A16] text-[#FAF6F4] border border-[#332520] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Salin skema SQL DDL mentah"
          >
            {copiedSql ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#9aa0a6]" />
            )}
            <span className="hidden sm:inline">Salin SQL</span>
          </button>

          {/* Fullscreen Modal Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#1A1311] hover:bg-[#251A16] text-[#A89892] hover:text-white border border-[#332520] transition cursor-pointer"
            title={isFullscreen ? "Kecilkan Kanvas" : "Layar Penuh (Fullscreen)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Node Graph Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2.0}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
          className="bg-[#0B0909]"
        >
          {/* Background Matrix Dots (n8n canvas pattern) */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1.25}
            color="#281C18"
            className="bg-[#0B0909]"
          />

          {/* Sleek Zoom & Navigation Controls */}
          <Controls
            position="bottom-left"
            showInteractive={false}
            className="!bg-[#140F0E] !border !border-[#2D1F1B] !rounded-xl !overflow-hidden !shadow-2xl [&>button]:!bg-[#140F0E] [&>button]:!border-b [&>button]:!border-[#2D1F1B] [&>button]:!text-[#A89892] hover:[&>button]:!text-white hover:[&>button]:!bg-[#1F1614] hover:[&>button]:!fill-white [&>button_svg]:!fill-current"
          />

          {/* MiniMap in Bottom Right */}
          <MiniMap
            position="bottom-right"
            nodeColor={(node) =>
              node.data?.isHighlighted ? "#D97757" : "#241815"
            }
            maskColor="rgba(11, 9, 9, 0.75)"
            className="!bg-[#140F0E] !border !border-[#2D1F1B] !rounded-xl !overflow-hidden !shadow-2xl hidden md:block"
            nodeStrokeWidth={2}
            nodeBorderRadius={4}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// ============================================================================
// 4. MAIN EXPORTED COMPONENT (WITH PROVIDER & FULLSCREEN MODAL SUPPORT)
// ============================================================================
interface VisualErdDiagramProps {
  sql: string;
}

export function VisualErdDiagram({ sql }: VisualErdDiagramProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutDirection, setLayoutDirection] = useState<"LR" | "TB">("LR");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tables = useMemo<ErdTable[]>(() => {
    return parseErdFromSql(sql);
  }, [sql]);

  if (tables.length === 0) {
    return (
      <div className="p-8 text-center space-y-3 bg-[#120E0D] rounded-xl border border-[#241A17] text-[#8D7D77] my-auto">
        <Database className="w-8 h-8 mx-auto text-[#D97757]/50 animate-pulse" />
        <p className="text-xs">
          Belum ada skema tabel PostgreSQL terdeteksi. Silakan minta KODA Architect untuk merancang skema DDL 3NF di dokumen PRD.
        </p>
      </div>
    );
  }

  const canvasContent = (
    <ReactFlowProvider>
      <ErdFlowCanvas
        sql={sql}
        tables={tables}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        layoutDirection={layoutDirection}
        setLayoutDirection={setLayoutDirection}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />
    </ReactFlowProvider>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-6 flex flex-col animate-in fade-in duration-200">
        <div className="w-full h-full rounded-2xl border border-[#2D1F1B] overflow-hidden shadow-2xl flex flex-col">
          {canvasContent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[540px] sm:h-[620px] rounded-2xl border border-[#241A17] overflow-hidden shadow-lg flex flex-col bg-[#0B0909]">
      {canvasContent}
    </div>
  );
}
