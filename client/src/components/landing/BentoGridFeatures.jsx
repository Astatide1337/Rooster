import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Megaphone,
    Users,
    ClipboardCheck,
    GraduationCap,
    BarChart3,
    LayoutDashboard
} from "lucide-react";
import { DemoDashboard } from "./DemoDashboard";
import { DemoClassDetail } from "./DemoClassDetail";

export function BentoGridFeatures() {
    return (
        <BentoGrid className="max-w-6xl mx-auto md:auto-rows-[25rem]">
            {items.map((item, i) => (
                <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    className={item.className}
                    icon={item.icon}
                />
            ))}
        </BentoGrid>
    );
}

const ScaleWrapper = ({ children, scale = 0.6 }) => (
    <div className="w-full h-full overflow-hidden relative bg-neutral-900/50 rounded-lg border border-white/5">
        <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
                transform: `scale(${scale})`,
                width: `${100 / scale}%`,
                height: `${100 / scale}%`
            }}
        >
            {children}
        </div>
        {/* Interaction blocker/overlay */}
        <div className="absolute inset-0 z-10 bg-transparent" />
    </div>
)

const items = [
    {
        title: "Unified Announcements",
        description: "Share updates with your students.",
        header: <ScaleWrapper><DemoClassDetail activeTab="home" /></ScaleWrapper>,
        className: "md:col-span-2",
        icon: <Megaphone className="h-4 w-4 text-neutral-500" />,

    },
    {
        title: "Command Center",
        description: "Your dashboard to manage your classes.",
        header: <ScaleWrapper><DemoDashboard /></ScaleWrapper>,
        className: "md:col-span-1",
        icon: <LayoutDashboard className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Smart Roster",
        description: "Manage students with ease. Bulk import students with CSV.",
        header: <ScaleWrapper><DemoClassDetail activeTab="roster" /></ScaleWrapper>,
        className: "md:col-span-2",
        icon: <Users className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Powerful Gradebook",
        description: "Grade assignments efficiently. Track points, feedback, and student progress in one view.",
        header: <ScaleWrapper><DemoClassDetail activeTab="grades" /></ScaleWrapper>,
        className: "md:col-span-1",
        icon: <GraduationCap className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Real Time Attendance",
        description: "Generate secure codes for checking in. Don't waste your time taking attendance.",
        header: <ScaleWrapper><DemoClassDetail activeTab="attendance" /></ScaleWrapper>,
        className: "md:col-span-2",
        icon: <ClipboardCheck className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Deep Analytics",
        description: "Data driven insights for your classroom. Monitor attendance and grade distribution.",
        header: <ScaleWrapper><DemoClassDetail activeTab="statistics" /></ScaleWrapper>,
        className: "md:col-span-1",
        icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
    },
];
