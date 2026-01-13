import { Interview } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Eye, Newspaper, Sparkles } from "lucide-react";

interface InterviewPinProps {
  interview: Interview;
  onMockPage?: boolean;
}

export const InterviewPin = ({
  interview,
  onMockPage = false,
}: InterviewPinProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer space-y-4 bg-white/50 backdrop-blur-sm">
      <div className="space-y-2">
        <CardTitle className="text-lg font-bold text-gray-800 tracking-tight">
            {interview?.position}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-gray-500">
            {interview?.description}
        </CardDescription>
      </div>
      
      <div className="w-full flex items-center gap-2 flex-wrap">
        {interview?.techStack.split(",").map((word, index) => (
          <Badge
            key={index}
            variant={"secondary"}
            className="text-xs font-medium text-gray-600 bg-gray-100/50 hover:bg-primary/10 hover:text-primary border-transparent transition-colors"
          >
            {word.trim()}
          </Badge>
        ))}
      </div>

      <CardFooter
        className={cn(
          "w-full flex items-center p-0 pt-2",
          onMockPage ? "justify-end" : "justify-between"
        )}
      >
        <p className="text-[11px] font-medium text-gray-400 truncate uppercase tracking-wider">
          {new Date(interview?.createdAt.toDate()).toLocaleDateString("en-US", {
            dateStyle: "medium",
          })}
        </p>

        {!onMockPage && (
          <div className="flex items-center gap-1">
            <TooltipButton
              content="View Details"
              buttonVariant={"ghost"}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate(`/generate/${interview?.id}`, { replace: true });
              }}
              disbaled={false}
              buttonClassName="w-8 h-8 hover:bg-primary/10 hover:text-primary transition-colors"
              icon={<Eye className="w-4 h-4" />}
              loading={false}
            />

            <TooltipButton
              content="Feedback"
              buttonVariant={"ghost"}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate(`/generate/feedback/${interview?.id}`, {
                  replace: true,
                });
              }}
              disbaled={false}
              buttonClassName="w-8 h-8 hover:bg-amber-100 hover:text-amber-600 transition-colors"
              icon={<Newspaper className="w-4 h-4" />}
              loading={false}
            />

            <TooltipButton
              content="Start Interview"
              buttonVariant={"ghost"}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate(`/generate/interview/${interview?.id}`, {
                  replace: true,
                });
              }}
              disbaled={false}
              buttonClassName="w-8 h-8 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
              icon={<Sparkles className="w-4 h-4" />}
              loading={false}
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
