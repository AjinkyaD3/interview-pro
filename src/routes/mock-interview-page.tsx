/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interview } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { QuestionSection } from "@/components/question-section";
import { RecordAnswer } from "@/components/record-answer";
import { Button } from "@/components/ui/button";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isWebCam, setIsWebCam] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchInterview = async () => {
      if (interviewId) {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({
              id: interviewDoc.id,
              ...interviewDoc.data(),
            } as Interview);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  if (!interviewId) {
    navigate("/generate", { replace: true });
    return null;
  }

  if (!interview) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
        <div className="flex items-center justify-between">
            <CustomBreadCrumb
                breadCrumbPage="Start Interview"
                breadCrumpItems={[
                    { label: "Mock Interviews", link: "/generate" },
                    {
                        label: interview?.position || "",
                        link: `/generate/interview/${interview?.id}`,
                    },
                ]}
            />
            
            <Button 
                variant="destructive" 
                size="sm"
                onClick={() => navigate(`/feedback/${interviewId}`)}
            >
                End Interview
            </Button>
        </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Questions & Navigation */}
        <div className="order-2 lg:order-1 w-full space-y-6">
             {interview?.questions && interview?.questions.length > 0 && (
                <QuestionSection 
                    questions={interview?.questions} 
                    activeQuestionIndex={activeQuestionIndex}
                />
            )}
        </div>

        {/* Right Column: Interaction Area (Video) */}
        <div className="order-1 lg:order-2 w-full space-y-6">
             <div className="sticky top-24 space-y-4">
                 <div className="flex items-center justify-between">
                     <h1 className="text-2xl font-bold text-gray-800 lg:text-3xl truncate">
                        {interview.position} Interview
                    </h1>
                </div>
                
                {interview?.questions && interview?.questions.length > 0 && (
                     <RecordAnswer 
                        question={interview?.questions[activeQuestionIndex]} 
                        isWebCam={isWebCam}
                        setIsWebCam={setIsWebCam}
                        resumeContext={interview.resume}
                        onAnswerSaved={() => {
                            if (activeQuestionIndex < (interview?.questions.length || 0) - 1) {
                                setActiveQuestionIndex(prev => prev + 1);
                            } else {
                                navigate(`/feedback/${interviewId}`);
                            }
                        }}
                    />
                )}
             </div>
        </div>
      </div>
    </div>
  );
};
