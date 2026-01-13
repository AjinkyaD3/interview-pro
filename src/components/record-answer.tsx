import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader2,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
  MessageSquare,
  Activity,
  Zap,
  Smile,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { SaveModal } from "./save-modal";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Card, CardContent, CardFooter } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
  resumeContext?: string;
  onAnswerSaved: () => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
  followUpQuestion?: string;
  confidence?: number;
  tone?: string;
  clarity?: number;
  resumeFeedback?: string; // New
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
  resumeContext,
  onAnswerSaved,
}: RecordAnswerProps) => {
  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followUpMode, setFollowUpMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  
  // Timer Logic
   useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRecording) {
            recordUserAnswer(); // Auto-stop
            toast.warning("Time's Up!", { description: "Recording stopped automatically." });
        }
        return () => clearInterval(interval);
    }, [isRecording, timeLeft]);
    
    // Reset timer when starting new answer
    useEffect(() => {
        if (!isRecording) {
            // Optional: Don't auto-reset to start immediately, wait for user.
            // But let's reset to 60 when they stop so next one is fresh.
            if(timeLeft === 0) setTimeLeft(60);
        }
    }, [isRecording]);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  const recordUserAnswer = async () => {
    if (isRecording) {
        stopSpeechToText();

        if (userAnswer?.length < 30) {
            toast.error("Answer too short", {
                description: "Your answer should be more than 30 characters",
            });
            return;
        }
        
        const jsonStructure = `
          {
            "ratings": number (1-10),
            "feedback": string (detailed critique),
            "followUpQuestion": string (optional, if needed),
            "confidence": number (1-10),
            "tone": string (one word adjective),
            "clarity": number (1-10)
          }
        `;
        
        let prompt = "";
        
        if (followUpMode && aiResult?.followUpQuestion) {
             prompt = `
              Question: "${aiResult.followUpQuestion}"
              User Answer: "${userAnswer}"
              Context (Previous Question): "${question.question}"
              
              Evaluate this answer. Analyze confidence and tone.
              Return strictly JSON in this format: ${jsonStructure}
            `;
        } else {
             prompt = `
               Question: "${question.question}"
               Correct Answer Context: "${question.answer}"
               User Answer: "${userAnswer}"
               ${resumeContext ? `Resume Context: ${resumeContext}` : ""}
               
               Evaluate technical correctness and soft skills.
               ${resumeContext ? "CRITICAL: Briefly verify if the answer aligns with the Resume claims. If they claimed expertise but gave a weak answer, mention it in 'resumeFeedback'." : ""}
               
               If the answer is short, vague, or lacks specific examples, you MUST ask a "followUpQuestion".
               
               Return strictly JSON in this format: 
               {
                "ratings": number (1-10),
                "feedback": string (detailed critique),
                "followUpQuestion": string (optional),
                "confidence": number (1-10),
                "tone": string,
                "clarity": number (1-10),
                "resumeFeedback": string (Short verification comment, e.g. "Aligns with resume" or "Contradicts resume claims")
               }
            `;
        }

        const result = await generateResult(prompt);

        if (result.followUpQuestion && !followUpMode) {
             setAiResult(result);
             setFollowUpMode(true);
             setUserAnswer(""); 
             toast.message("Follow-up Question Required", {
                 description: "The interviewer needs more details."
             });
        } else {
             setAiResult(result);
             setFollowUpMode(false); 
        }
    } else {
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/(json|```|`)/g, "");
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON: " + (error as Error)?.message);
    }
  };

  const generateResult = async (prompt: string): Promise<AIResponse> => {
    setIsAiGenerating(true);
    try {
      const aiResult = await chatSession.sendMessage(prompt);
      const parsedResult: AIResponse = cleanJsonResponse(aiResult.response.text());
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast.error("Analysis Failed");
      return { ratings: 0, feedback: "Error generating feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    setAiResult(null);
    setFollowUpMode(false);
    setTimeLeft(60); // Reset timer
    stopSpeechToText();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    setLoading(true);
    if (!aiResult) return;

    try {
      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", question.question)
      );

      const querySnap = await getDocs(userAnswerQuery);

      if (!querySnap.empty && !followUpMode) { 
        toast.info("Already Answered");
        return;
      } else {
        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer, 
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          confidence: aiResult.confidence,
          tone: aiResult.tone,
          clarity: aiResult.clarity,
          resumeFeedback: aiResult.resumeFeedback || "Not available",
          userId,
          createdAt: serverTimestamp(),
        });
        toast.success("Answer Saved!");
      }

      setUserAnswer("");
      setAiResult(null);
      stopSpeechToText();
      onAnswerSaved(); // Advance to next question
    } catch (error) {
      toast.error("Error Saving");
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(false); 
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combineTranscripts);
  }, [results]);

  return (
    <div className="w-full flex flex-col gap-6">
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      {/* Video / Main Interaction Area */}
      <Card className="border-none shadow-xl bg-black overflow-hidden rounded-2xl relative">
        <CardContent className="p-0 aspect-video relative group">
            
            {/* Webcam / Placeholder */}
            {isWebCam ? (
                <WebCam
                    onUserMedia={() => setIsWebCam(true)}
                    onUserMediaError={() => setIsWebCam(false)}
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                    <WebcamIcon className="w-20 h-20 opacity-30 mb-4" />
                    <p className="font-medium">Camera is Off</p>
                </div>
            )}

            {/* Follow-Up Overlay - Only visible when needed */}
            {followUpMode && aiResult?.followUpQuestion && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20 animate-in fade-in zoom-in">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Follow-up Question</h2>
                    <p className="text-lg text-blue-100 font-medium max-w-2xl leading-relaxed">
                        "{aiResult.followUpQuestion}"
                    </p>
                    <p className="text-sm text-zinc-400 mt-8 animate-pulse">
                         Press the microphone button to answer...
                    </p>
                </div>
            )}

            {isRecording && (
                <div className="absolute top-6 right-6 flex items-center gap-4 z-30">
                     {/* Timer Badge */}
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg transition-colors duration-300",
                        timeLeft > 30 ? "bg-white/10 text-white backdrop-blur-md" : 
                        timeLeft > 10 ? "bg-yellow-500/90 text-black" : 
                        "bg-red-600 text-white animate-pulse"
                    )}>
                        <Clock className="w-4 h-4" />
                        <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-red-600/90 text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse shadow-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        REC
                    </div>
                </div>
            )}
        </CardContent>
        
        {/* Persistent Bottom Control Bar */}
        <CardFooter className="bg-zinc-900 p-4 flex items-center justify-center gap-6 border-t border-zinc-800">
             <TooltipButton
                content={isWebCam ? "Turn Off Camera" : "Turn On Camera"}
                icon={isWebCam ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                onClick={() => setIsWebCam(!isWebCam)}
                buttonVariant="ghost"
                buttonClassName={cn("rounded-full w-12 h-12 transition-all duration-200", isWebCam ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-red-500/10 text-red-500 hover:bg-red-500/20")}
            />

            <TooltipButton
                content={isRecording ? "Stop Recording" : "Start Answer"}
                icon={isRecording ? <CircleStop className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                onClick={recordUserAnswer}
                buttonVariant="default"
                buttonClassName={cn(
                    "rounded-full w-16 h-16 shadow-lg transition-all duration-300 transform hover:scale-105",
                    isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-white text-black hover:bg-gray-200"
                )}
            />

            <TooltipButton
                content="Restart / New Answer"
                icon={<RefreshCw className="w-5 h-5" />}
                onClick={recordNewAnswer}
                buttonVariant="ghost"
                 buttonClassName="rounded-full w-12 h-12 bg-zinc-800 text-white hover:bg-zinc-700 transition-all duration-200"
            />
        </CardFooter>
      </Card>

      {/* Results / Feedback Area */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
            <Tabs defaultValue="transcript" className="w-full">
                <div className="flex items-center justify-between mb-4">
                     <TabsList className="bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger value="transcript" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Transcript</TabsTrigger>
                        <TabsTrigger value="feedback" disabled={!aiResult} className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Feedback</TabsTrigger>
                    </TabsList>
                    
                     {aiResult && !followUpMode && (
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md"
                            onClick={() => setOpen(true)}
                        >
                             <Save className="w-4 h-4" /> Save Result
                        </Button>
                    )}
                </div>

                <TabsContent value="transcript" className="mt-0">
                     <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[120px] relative">
                         {!userAnswer && !isRecording && (
                             <div className="absolute inset-0 flex items-center justify-center text-gray-400 gap-2">
                                 <Mic className="w-4 h-4" /> 
                                 <span className="text-sm">Press the microphone to start speaking...</span>
                             </div>
                         )}
                         <p className="text-gray-700 leading-relaxed font-medium">
                            {userAnswer}
                         </p>
                     </div>
                </TabsContent>

                <TabsContent value="feedback" className="mt-0 space-y-6">
                      {isAiGenerating ? (
                           <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                               <Loader2 className="w-8 h-8 animate-spin text-primary" />
                               <p className="text-sm font-medium">Analyzing your answer...</p>
                           </div>
                      ) : aiResult && (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                               {/* Metrics Grid */}
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                     <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-1 group hover:border-emerald-200 transition-colors">
                                        <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Confidence</span>
                                        <div className="text-2xl font-black text-emerald-700 flex items-center gap-1.5">
                                            <Activity className="w-5 h-5" />
                                            {aiResult.confidence || 0}/10
                                        </div>
                                    </div>
                                    
                                     <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center gap-1 group hover:border-blue-200 transition-colors">
                                        <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Tone</span>
                                        <div className="text-xl font-black text-blue-700 flex items-center gap-1.5">
                                            <Smile className="w-5 h-5" />
                                            {aiResult.tone || "Neutral"}
                                        </div>
                                    </div>
                                    
                                     <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex flex-col items-center justify-center gap-1 group hover:border-purple-200 transition-colors">
                                        <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">Clarity</span>
                                        <div className="text-2xl font-black text-purple-700 flex items-center gap-1.5">
                                            <Zap className="w-5 h-5" />
                                            {aiResult.clarity || 0}/10
                                        </div>
                                    </div>
                               </div>
                               
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                     <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-primary" />
                                            Detailed Feedback
                                        </h4>
                                        <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                                            Overall Rating: {aiResult.ratings}/10
                                        </div>
                                     </div>
                                     <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                         {aiResult.feedback}
                                     </p>
                                </div>
                          </div>
                      )}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
