"use client";

import React, { useState } from "react";
import {
  Code2,
  History,
  PanelRightClose,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { GoogleIcon } from "./GoogleIcon";

interface RunSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
  groundingEnabled: boolean;
  setGroundingEnabled: (val: boolean) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  thinkingLevel: string;
  setThinkingLevel: (val: string) => void;
  systemInstructions: string;
  setSystemInstructions: (val: string) => void;
  onOpenModelSelection?: () => void;
  onOpenSystemInstructions?: () => void;
}

export function RunSettings({
  isOpen = true,
  onClose,
  groundingEnabled,
  setGroundingEnabled,
  selectedModel,
  setSelectedModel,
  thinkingLevel,
  setThinkingLevel,
  systemInstructions,
  setSystemInstructions,
  onOpenModelSelection,
  onOpenSystemInstructions,
}: RunSettingsProps) {
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [structuredOutputs, setStructuredOutputs] = useState(false);
  const [codeExecution, setCodeExecution] = useState(false);
  const [functionCalling, setFunctionCalling] = useState(false);
  const [googleMaps, setGoogleMaps] = useState(false);
  const [urlContext, setUrlContext] = useState(false);
  const [temperature, setTemperature] = useState(1.0);
  const [topP, setTopP] = useState(0.95);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-80 h-screen flex flex-col border-l border-[#282a2c] bg-[#18191a] text-[#c4c7c5] text-xs shrink-0 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#282a2c]">
        <span className="font-semibold text-sm text-[#f1f3f4]">Run settings</span>
        <div className="flex items-center gap-1.5 text-[#9aa0a6]">
          <button
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#c4c7c5] hover:text-white bg-[#282a2c] hover:bg-[#35373a] rounded-md transition"
            title="Get Code"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Get code</span>
          </button>
          <button
            className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
            title="Revision history"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:text-[#f1f3f4] hover:bg-[#282a2c] rounded-md transition"
            title="Close settings"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Model Card */}
        <div
          onClick={onOpenModelSelection}
          className="rounded-xl bg-[#212224] border border-[#2e3032] p-3.5 space-y-2 hover:border-[#5a5d61] hover:bg-[#252729] cursor-pointer transition group"
          role="button"
          tabIndex={0}
          title="Click to change model"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-[#f1f3f4] group-hover:text-white transition">
              {selectedModel}
            </span>
            <ChevronDown className="w-4 h-4 text-[#80868b] group-hover:text-[#f1f3f4] transition" />
          </div>
          <p className="text-[11px] font-mono text-[#d97736]">
            {selectedModel.toLowerCase().replace(/\s+/g, "-")}
          </p>
          <p className="text-[11.5px] leading-relaxed text-[#9aa0a6]">
            Engineered for long-horizon software requirements engineering, autonomous agent flow generation, and missing requirement detection.
          </p>
        </div>

        {/* System Instructions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-medium text-[#e3e3e3] text-xs">
              System Instructions
            </label>
            {onOpenSystemInstructions && (
              <button
                type="button"
                onClick={onOpenSystemInstructions}
                className="text-[11px] text-[#a8c7fa] hover:underline"
              >
                Expand / Presets
              </button>
            )}
          </div>
          <Textarea
            value={systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
            placeholder="Optional tone and style instructions for the model"
            className="min-h-[70px] bg-[#212224] border-[#2e3032] text-[#e3e3e3] placeholder:text-[#80868b] text-xs rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-[#d97736]"
          />
        </div>

        {/* Thinking Level */}
        <div className="space-y-1.5">
          <label className="font-medium text-[#e3e3e3] text-xs">
            Thinking level
          </label>
          <div className="relative">
            <select
              value={thinkingLevel}
              onChange={(e) => setThinkingLevel(e.target.value)}
              className="w-full appearance-none bg-[#212224] border border-[#2e3032] text-[#f1f3f4] text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#d97736] cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#9aa0a6] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Tools Section */}
        <div className="border-t border-[#282a2c] pt-4">
          <button
            onClick={() => setToolsExpanded(!toolsExpanded)}
            className="w-full flex items-center justify-between text-[#e3e3e3] font-medium text-xs mb-3 group"
          >
            <span>Tools</span>
            {toolsExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#9aa0a6]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#9aa0a6]" />
            )}
          </button>

          {toolsExpanded && (
            <div className="space-y-3.5 pl-0.5">
              {/* Structured outputs */}
              <div className="flex items-center justify-between">
                <span className="text-[#c4c7c5]">Structured outputs</span>
                <div className="flex items-center gap-2">
                  <button className="text-[11px] text-[#d97736] hover:underline">
                    Edit
                  </button>
                  <Switch
                    checked={structuredOutputs}
                    onCheckedChange={setStructuredOutputs}
                  />
                </div>
              </div>

              {/* Code execution */}
              <div className="flex items-center justify-between">
                <span className="text-[#c4c7c5]">Code execution</span>
                <Switch
                  checked={codeExecution}
                  onCheckedChange={setCodeExecution}
                />
              </div>

              {/* Function calling */}
              <div className="flex items-center justify-between">
                <span className="text-[#c4c7c5]">Function calling</span>
                <div className="flex items-center gap-2">
                  <button className="text-[11px] text-[#d97736] hover:underline">
                    Edit
                  </button>
                  <Switch
                    checked={functionCalling}
                    onCheckedChange={setFunctionCalling}
                  />
                </div>
              </div>

              {/* Grounding with Google Search */}
              <div className="flex items-start justify-between gap-2 pt-1 border-t border-[#282a2c]/60">
                <div className="space-y-0.5">
                  <div className="text-[#f1f3f4] font-medium">
                     Grounding with Google Search
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#9aa0a6]">
                    <span>Source:</span>
                    <GoogleIcon className="w-3 h-3" />
                    <span>Google Search</span>
                  </div>
                </div>
                <Switch
                  checked={groundingEnabled}
                  onCheckedChange={setGroundingEnabled}
                  className="data-[state=checked]:bg-[#d97736]"
                />
              </div>

              {/* Grounding with Google Maps */}
              <div className="flex items-center justify-between">
                <span className="text-[#c4c7c5]">Grounding with Google Maps</span>
                <Switch
                  checked={googleMaps}
                  onCheckedChange={setGoogleMaps}
                />
              </div>

              {/* URL context */}
              <div className="flex items-center justify-between">
                <span className="text-[#c4c7c5]">URL context</span>
                <Switch
                  checked={urlContext}
                  onCheckedChange={setUrlContext}
                />
              </div>
            </div>
          )}
        </div>

        {/* Advanced settings */}
        <div className="border-t border-[#282a2c] pt-4">
          <button
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="w-full flex items-center justify-between text-[#e3e3e3] font-medium text-xs group"
          >
            <span>Advanced settings</span>
            {advancedExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#9aa0a6]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#9aa0a6]" />
            )}
          </button>

          {advancedExpanded && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-[11px] text-[#9aa0a6] mb-1.5">
                  <span>Temperature</span>
                  <span>{temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={temperature}
                  onValueChange={(val) =>
                    setTemperature(typeof val === "number" ? val : val[0])
                  }
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#9aa0a6] mb-1.5">
                  <span>Top P</span>
                  <span>{topP.toFixed(2)}</span>
                </div>
                <Slider
                  value={topP}
                  onValueChange={(val) =>
                    setTopP(typeof val === "number" ? val : val[0])
                  }
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>

            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
