"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Code2 } from "lucide-react";
import { SystemFlowDiagram, isSequenceFlow } from "@/components/playground/SystemFlowDiagram";
import { InteractiveInterview, isInterviewJson } from "@/components/playground/InteractiveInterview";
import { DribbbleDesignShowcase, isDribbbleDesignJson } from "@/components/playground/DribbbleDesignShowcase";
import { PrdReadyActionCard, isPrdReadyJson } from "@/components/playground/PrdReadyActionCard";
import { DiscoverySummaryCard, isDiscoverySummaryJson } from "@/components/playground/DiscoverySummaryCard";
import { DiscoveryQuestionsCard, isDiscoveryDecisionsJson } from "@/components/playground/DiscoveryQuestionsCard";
import { DiscoveryStage2Card, isDiscoveryStage2Json } from "@/components/playground/DiscoveryStage2Card";
import { DiscoveryConflictCard, isDiscoveryConflictJson } from "@/components/playground/DiscoveryConflictCard";
import { DiscoveryFinalQuestionsCard, isDiscoveryFinalQuestionsJson } from "@/components/playground/DiscoveryFinalQuestionsCard";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onAnswerQuestion?: (answerText: string) => void;
  onCompilePRD?: () => void;
  isTyping?: boolean;
}

export function MarkdownRenderer({
  content,
  className = "",
  onAnswerQuestion,
  onCompilePRD,
  isTyping = false,
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-content space-y-3 text-[15px] sm:text-base leading-relaxed text-[#e3e3e3] ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }: any) => (
            <div className="my-3 rounded-2xl overflow-hidden border border-[#2e3032] bg-[#141517] shadow-lg group">
              <img
                src={src}
                alt={alt || "Inspirasi Desain"}
                className="w-full h-auto object-cover max-h-[460px] transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              {alt && (
                <div className="p-2.5 bg-[#1a1b1d] border-t border-[#282a2c] text-xs text-[#9aa0a6] text-center">
                  {alt}
                </div>
              )}
            </div>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-[26px] font-bold text-white mt-7 mb-3.5 tracking-tight border-b border-[#282a2c] pb-2.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-white mt-6 mb-3 tracking-tight flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold text-white mt-5 mb-2.5 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-semibold text-[#f1f3f4] mt-4 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[15px] sm:text-base leading-relaxed text-[#dcdcdc] mb-3.5 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-6 space-y-2 my-3.5 text-[15px] sm:text-base text-[#dcdcdc]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-6 space-y-2 my-3.5 text-[15px] sm:text-base text-[#dcdcdc]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 text-[#e3e3e3]">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#c4c7c5]">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-[3px] border-[#d97736] bg-[#1c1d20] pl-4 pr-3.5 py-3 my-4 rounded-r-xl text-[#dcdcdc] text-sm not-italic leading-relaxed shadow-sm">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-[#282a2c] my-5" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-[#2e3032] bg-[#161719] shadow-sm">
              <table className="w-full text-xs sm:text-[13px] text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1f2023] text-[#f1f3f4] font-semibold border-b border-[#2e3032]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-semibold text-[#f1f3f4] whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 border-b border-[#282a2c]/60 text-[#c4c7c5] leading-relaxed">
              {children}
            </td>
          ),
          pre: ({ children }: any) => <>{children}</>,
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && (match || codeString.includes("\n"))) {
              // Check if code contains Dribbble design showcase
              if (isDribbbleDesignJson(codeString, language)) {
                return <DribbbleDesignShowcase rawJson={codeString} />;
              }

              // Check if code contains interactive interview questionnaire
              if (isInterviewJson(codeString, language)) {
                return (
                  <InteractiveInterview
                    rawJson={codeString}
                    onSubmitAnswers={onAnswerQuestion}
                  />
                );
              }

              // Check if code contains PRD ready action card (Industry Standard Reached)
              if (isPrdReadyJson(codeString, language)) {
                return (
                  <PrdReadyActionCard
                    rawJson={codeString}
                    fullContent={content}
                    onCompilePRD={onCompilePRD}
                  />
                );
              }

              // Check if code contains Discovery Summary Card (Discovery 01 — AppName)
              if (isDiscoverySummaryJson(codeString, language)) {
                return <DiscoverySummaryCard rawJson={codeString} />;
              }

              // Check if code contains Discovery Decisions Questionnaire
              if (isDiscoveryDecisionsJson(codeString, language)) {
                return (
                  <DiscoveryQuestionsCard
                    rawJson={codeString}
                    onSubmit={onAnswerQuestion}
                  />
                );
              }

              // Check if code contains Discovery Stage 2 Questions Card
              if (isDiscoveryStage2Json(codeString, language)) {
                return (
                  <DiscoveryStage2Card
                    rawJson={codeString}
                    onSubmit={onAnswerQuestion}
                  />
                );
              }

              // Check if code contains Discovery Conflict Analysis Card
              if (isDiscoveryConflictJson(codeString, language)) {
                return <DiscoveryConflictCard rawJson={codeString} />;
              }

              // Check if code contains Discovery Final Questions Card (Stage 3)
              if (isDiscoveryFinalQuestionsJson(codeString, language)) {
                return (
                  <DiscoveryFinalQuestionsCard
                    rawJson={codeString}
                    onSubmit={onAnswerQuestion}
                  />
                );
              }

              // Check if code contains sequence flow diagram (like flow-json or sequence flow)
              if (isSequenceFlow(codeString, language)) {
                return <SystemFlowDiagram rawCode={codeString} language={language} />;
              }

              return (
                <CodeBlock language={language} code={codeString} />
              );
            }

            return (
              <code
                className="bg-[#222427] text-[#e88b4d] px-1.5 py-0.5 rounded-md text-[12px] font-mono border border-[#3c4043]/60 font-medium inline-block align-baseline"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {isTyping && <span className="typing-cursor" aria-hidden="true" />}
    </div>
  );
}

function CodeBlock({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#2e3032] bg-[#141517] shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#1b1c1e] border-b border-[#282a2c] text-xs text-[#9aa0a6]">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-[#d97736]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#c4c7c5]">
            {language || "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] hover:text-white hover:bg-[#282a2c] transition"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-[#f1f3f4] overflow-x-auto leading-relaxed selection:bg-[#3c4043]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
