import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";
import { CircleCheck, Star, Trophy, Award, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }
  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        if (interviewId) {
          try {
            const interviewDoc = await getDoc(
              doc(db, "interviews", interviewId)
            );
            if (interviewDoc.exists()) {
              setInterview({
                id: interviewDoc.id,
                ...interviewDoc.data(),
              } as Interview);
            }
          } catch (error) {
            console.log(error);
          }
        }
      };

      const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
          const querSanpRef = query(
            collection(db, "userAnswers"),
            where("userId", "==", userId),
            where("mockIdRef", "==", interviewId)
          );

          const querySnap = await getDocs(querSanpRef);

          const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as UserAnswer;
          });

          setFeedbacks(interviewData);
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchInterview();
      fetchFeedbacks();
    }
  }, [interviewId, navigate, userId]);

  //   calculate the ratings out of 10

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";

    const totalRatings = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );

    return (totalRatings / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={"Feedback"}
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/generate" },
            {
              label: `${interview?.position}`,
              link: `/generate/interview/${interview?.id}`,
            },
          ]}
        />
      </div>

      <Headings
        title="Congratulations !"
        description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
      />

      <p className="text-base text-muted-foreground">
        Your overall interview performance :{" "}
      </p>
      
      {/* 4-Card Stats Dashboard */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Overall Rating */}
            <Card className="border-none shadow-md bg-white border-l-4 border-l-emerald-500">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-500" />
                        Average Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-emerald-700">{overAllRating} / 10</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all questions</p>
                </CardContent>
            </Card>

            {/* Highest Score */}
             <Card className="border-none shadow-md bg-white border-l-4 border-l-blue-500">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        Best Answer
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-blue-700">
                        {feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.rating)) : 0} / 10
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">Highest rated response</p>
                </CardContent>
            </Card>

            {/* Lowest Score */}
            <Card className="border-none shadow-md bg-white border-l-4 border-l-red-500">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Weakest Area
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-red-700">
                        {feedbacks.length > 0 ? Math.min(...feedbacks.map(f => f.rating)) : 0} / 10
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Needs improvement</p>
                </CardContent>
            </Card>

            {/* Questions Completed */}
            <Card className="border-none shadow-md bg-white border-l-4 border-l-purple-500">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        Completed
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-purple-700">
                        {feedbacks.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Questions answered</p>
                </CardContent>
            </Card>
       </div>
       
       <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={5000}
        />

      {interview && <InterviewPin interview={interview} onMockPage />}

      <Headings title="Interview Feedback" isSubHeading />

      {feedbacks && (
        <Accordion type="single" collapsible className="space-y-6">
          {feedbacks.map((feed) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className="border rounded-lg shadow-md"
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className={cn(
                  "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                  activeFeed === feed.id
                    ? "bg-gradient-to-r from-purple-50 to-blue-50"
                    : "hover:bg-gray-50"
                )}
              >
                <span>{feed.question}</span>
              </AccordionTrigger>

              <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                <div className="text-lg font-semibold to-gray-700">
                  <Star className="inline mr-2 text-yellow-400" />
                  Rating : {feed.rating}
                </div>

                {/* Soft Skills Grid */}
                {(feed.confidence || feed.tone || feed.clarity) && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-1">
                           <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Confidence</span>
                           <div className="text-lg font-black text-emerald-700 flex items-center gap-1.5">
                               {feed.confidence || 0}/10
                           </div>
                       </div>
                       
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center gap-1">
                           <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Tone</span>
                           <div className="text-base font-black text-blue-700 flex items-center gap-1.5">
                               {feed.tone || "Neutral"}
                           </div>
                       </div>
                       
                        <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 flex flex-col items-center justify-center gap-1">
                           <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Clarity</span>
                           <div className="text-lg font-black text-purple-700 flex items-center gap-1.5">
                               {feed.clarity || 0}/10
                           </div>
                       </div>
                  </div>
                )}
                
                {/* Resume Verification Section */}
                 {feed.resumeFeedback && (
                      <Card className="border-none space-y-3 p-4 bg-orange-50 rounded-lg shadow-md border-orange-100">
                          <CardTitle className="flex items-center text-lg text-orange-800">
                              <CircleCheck className="mr-2 text-orange-600" />
                              Resume Verification
                          </CardTitle>
                          <CardDescription className="font-medium text-orange-900/80">
                               {feed.resumeFeedback}
                          </CardDescription>
                      </Card>
                 )}

                <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-green-600" />
                    Expected Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-yellow-600" />
                    Your Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-red-600" />
                    Feedback
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
