"use client";

import React, { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ClaudeHeroCanvas } from "@/components/landing/ClaudeHeroCanvas";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PutToWorkSection } from "@/components/landing/PutToWorkSection";
import { MeetingsWorkflowSection } from "@/components/landing/MeetingsWorkflowSection";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { ChangeTheWayYouWorkSection } from "@/components/landing/ChangeTheWayYouWorkSection";
import { MindMapSection } from "@/components/landing/MindMapSection";
import { RoleTaskShowcaseSection } from "@/components/landing/RoleTaskShowcaseSection";
import { AskClaudeCtaSection } from "@/components/landing/AskClaudeCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function RootLandingPage() {
  const [brandName, setBrandName] = useState<string>("Koda");

  const toggleBrand = () => {
    setBrandName((prev) => (prev === "Koda" ? "Claude" : "Koda"));
  };

  return (
    <main className="min-h-screen bg-[#141413] text-[#FAF9F5] flex flex-col font-sans selection:bg-[#FAF9F5] selection:text-[#141413]">
      {/* Top Navigation */}
      <LandingHeader brandName={brandName} onToggleBrand={toggleBrand} />

      {/* Section 1: Hero Canvas with scattered ambient floating cards */}
      <ClaudeHeroCanvas brandName={brandName} />

      {/* Section 2: Interactive Document Preview & 3-Column Features Grid */}
      <FeaturesSection brandName={brandName} />

      {/* Section 3: Put Claude to Work with 7 Department / Role Tabs */}
      <PutToWorkSection brandName={brandName} />

      {/* Section 4: Keep up with meetings all day & App Integration Dock */}
      <MeetingsWorkflowSection brandName={brandName} />

      {/* Section 5: Customer Story & Audio Testimonial Carousel */}
      <TestimonialSection brandName={brandName} />

      {/* Section 6: Change the way you work & Capabilities CTA */}
      <ChangeTheWayYouWorkSection brandName={brandName} />

      {/* Section 7: Constellation Mind Map of Capabilities */}
      <MindMapSection brandName={brandName} />

      {/* Section 8: Interactive Role & Task Matrix Deck */}
      <RoleTaskShowcaseSection brandName={brandName} />

      {/* Section 9: "Don't know where to start? Ask Claude." CTA */}
      <AskClaudeCtaSection brandName={brandName} />

      {/* Section 10: Complete Landing Footer & Directory */}
      <LandingFooter brandName={brandName} />
    </main>
  );
}
