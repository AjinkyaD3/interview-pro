import { useState } from "react";

import { TooltipButton } from "./tooltip-button";
import { Volume2, VolumeX, Lightbulb} from "lucide-react";

interface QuestionSectionProps {
  questions: { question: string; answer: string }[];
  activeQuestionIndex: number;
}

export const QuestionSection = ({ questions, activeQuestionIndex }: QuestionSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);

  const handlePlayQuestion = (qst: string) => {
    if (isPlaying && currentSpeech) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech(null);
    } else {
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(qst);
        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
        setCurrentSpeech(speech);
        speech.onend = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };
      }
    }
  };

  const currentQuestion = questions[activeQuestionIndex];

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      
      {/* Question Card */}
      <div className="p-8 bg-white border border-gray-100 rounded-[24px] shadow-lg space-y-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[150px] -z-0 transition-transform duration-700 group-hover:scale-110"></div>

            <div className="flex items-center justify-between relative z-10">
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">
                    Current Question
                </span>
                <TooltipButton
                    content={isPlaying ? "Stop Reading" : "Read Aloud"}
                    icon={
                        isPlaying ? (
                            <VolumeX className="w-6 h-6 text-gray-400" />
                        ) : (
                            <Volume2 className="w-6 h-6 text-primary" />
                        )
                    }
                    onClick={() => handlePlayQuestion(currentQuestion?.question)}
                    buttonVariant="ghost"
                    buttonClassName="hover:bg-gray-100 rounded-full w-12 h-12"
                />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight relative z-10 tracking-tight">
                {currentQuestion?.question}
            </h2>

            <div className="flex items-start gap-4 p-5 bg-amber-50/80 rounded-2xl border border-amber-100/60 backdrop-blur-sm">
                <Lightbulb className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-base text-amber-800/90 leading-relaxed font-medium">
                    <span className="font-bold text-amber-900">Pro Tip:</span> Take a deep breath. Structure your answer with a beginning, middle, and end.
                </p>
            </div>
        </div>
    </div>
  );
};
