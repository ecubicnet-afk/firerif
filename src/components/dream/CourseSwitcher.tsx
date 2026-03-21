"use client";

import { cn } from "@/lib/utils";
import { COURSES } from "@/lib/dream-constants";
import type { CourseId } from "@/types/dream";

interface CourseSwitcherProps {
  courseId: CourseId;
  onCourseChange: (courseId: CourseId) => void;
}

export function CourseSwitcher({ courseId, onCourseChange }: CourseSwitcherProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {COURSES.map((course) => {
        const isActive = course.id === courseId;
        return (
          <button
            key={course.id}
            onClick={() => onCourseChange(course.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-md text-xs font-medium transition-all",
              isActive
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <span className="text-base">{course.icon}</span>
            <span className={cn("font-bold", isActive ? course.color : "text-muted-foreground")}>
              {course.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {course.indexName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              年利{Math.round(course.annualRate * 100)}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
