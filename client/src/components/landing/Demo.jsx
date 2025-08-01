//src/components/landing/Demo.jsx
"use client";
import React from "react";
import { StickyScroll } from "./StickyScroll";
import whatsapp_chatbot from "../../assets/whatsapp_chatbot.gif";
import scheduler from "../../assets/scheduler.svg";
import escalations from "../../assets/escalations.svg";
 
const content = [
  {
    title: "Build Workflows That Think Like You Do",
    description:
      "Empower your teams with smart escalation logic tailored to your project realities. Set up rules based on due dates, issue categories, user roles, or any custom condition all through an intuitive interface all without writing a single line of code.",
    content: (
<div className="h-full w-full flex items-center justify-center text-white">
        Custom Logic Engine
</div>
    ),
  },
  {
    title: "Keep Everyone Informed - Instantly, and Personally",
    description:
      "Empower your teams with an AI-powered chatbot that lives inside WhatsApp. Field staff and managers can ask natural-language questions and get instant, context-aware responses based on live project data. No dashboards. No delays. Just answers, when you need them.",
    content: (
<div className="h-full w-full flex items-center justify-center text-white">
      <img src={whatsapp_chatbot} alt="Whatsapp Chatbot" />
</div>
    ),
  },
  {
    title: "Escalate Smartly - Based on Delay, Role, and Responsibility",
    description:
      "Not all delays are equal; and neither are your team members’ responsibilities. Configure flexible, multi-stage escalation rules that adapt based on who’s involved, how long an item’s been stuck, and what needs attention first.",
    content: (
<div className="h-full w-full flex items-center justify-center ">
        <img src={escalations} alt="Escalations" />
</div>
    ),
  },
  {
    title: "Control the Noise - Run Only When It Matters",
    description:
      "Avoid unnecessary weekend alerts or notification fatigue. With built-in scheduling controls, your workflows run only on selected days so your automation stays focused, intentional, and respectful of human bandwidth.",
    content: (
<div className="h-full w-full flex items-center justify-center bg-white">
        <img src={scheduler} className="transform scale-75" alt="Scheduler" />
</div>
    ),
  },
];
 
export default function StickyScrollRevealDemo() {
  return (
<section>
  <div>
    <StickyScroll content={content} />
  </div>
</section>
  );
}