import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Interview } from "@/types";

import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Headings } from "./headings";
import { Button } from "./ui/button";
import { Loader, Sparkles, Trash2, Briefcase, FileText, Clock, Code2, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; 
import { chatSession, generateJobDetailsFromResume } from "@/scripts";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Card, CardContent } from "./ui/card";
import { extractTextFromFile } from "@/lib/file-parser";
import { cn } from "@/lib/utils";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(10, "Description is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least a character"),
  resume: z.string().optional(),
  interviewType: z.string().min(1, "Interview type is required"),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsParsing(true);
          try {
              const text = await extractTextFromFile(file);
              form.setValue("resume", text);

              toast.info("Analyzing Resume...", { description: "Extracting job details..." });

              // Auto-fill logic
              const aiResponse = await generateJobDetailsFromResume(text);
              const cleanData = cleanAiResponse(aiResponse);

              if (cleanData) {
                  form.setValue("position", cleanData.position || "");
                  form.setValue("description", cleanData.description || "");
                  form.setValue("experience", Number(cleanData.experience) || 0);
                  form.setValue("techStack", cleanData.techStack || "");

                  toast.success("Auto-Filled Details", {
                      description: "We extracted your role and experience automatically!"
                  });
              }

          } catch (error) {
              console.error(error);
              toast.error("Analysis Failed", {
                  description: "Resume text saved, but auto-fill failed. Please fill details manually."
              });
          } finally {
              setIsParsing(false);
          }
      }
  };

  const title = initialData
    ? "Edit Interview Details"
    : "Create a New Mock Interview";

  const breadCrumpPage = initialData ? initialData?.position : "Create";
  const actions = initialData ? "Save Changes" : "Generate Interview";
  const toastMessage = initialData
    ? { title: "Updated!", description: "Changes saved successfully." }
    : { title: "Success!", description: "Mock Interview generated successfully." };

  const cleanAiResponse = (responseText: string) => {
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    const jsonArrayMatch = cleanText.match(/\[.*\]/s);
    if (jsonArrayMatch) {
      cleanText = jsonArrayMatch[0];
    } else {
      throw new Error("No JSON array found in response");
    }

    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateAiResponse = async (data: FormData) => {
     const prompt = `
        As an experienced prompt engineer, generate a JSON array containing 5 ${data.interviewType} interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

        [
          { "question": "<Question text>", "answer": "<Answer text>" },
          ...
        ]

        Job Information:
        - Job Position: ${data?.position}
        - Job Description: ${data?.description}
        - Years of Experience Required: ${data?.experience}
        - Tech Stacks: ${data?.techStack}
        - Interview Type: ${data.interviewType} (Strictly adhere to this style)
        
        Candidate Resume Context:
        ${data.resume || "Not provided"}

        The questions should assess skills matches the interview type (${data.interviewType}). 
        - If "Technical", focus on code, architecture, and problem solving.
        - If "Behavioral", focus on soft skills, star method, and scenarios.
        - If "HR", focus on culture fit, salary, and personality.
        
        Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
        `;

    const aiResult = await chatSession.sendMessage(prompt);
    const cleanedResponse = cleanAiResponse(aiResult.response.text());

    return cleanedResponse;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      if (initialData) {
        if (isValid) {
          const aiResult = await generateAiResponse(data);
          await updateDoc(doc(db, "interviews", initialData?.id), {
            questions: aiResult,
            ...data,
            updatedAt: serverTimestamp(),
          }).catch((error) => console.error(error));
          toast(toastMessage.title, { description: toastMessage.description });
        }
      } else {
        if (isValid) {
          const aiResult = await generateAiResponse(data);
          await addDoc(collection(db, "interviews"), {
            ...data,
            userId,
            questions: aiResult,
            createdAt: serverTimestamp(),
          });
          toast(toastMessage.title, { description: toastMessage.description });
        }
      }

      navigate("/generate", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: `Something went wrong. Please try again later`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
        resume: initialData.resume || "",
        interviewType: initialData.interviewType || "Technical",
      });
    } else {
        form.setValue("interviewType", "Technical");
    }
  }, [initialData, form]);

  return (
    <div className="w-full flex-col space-y-6">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />
        
        {initialData && (
            <Button size={"icon"} variant={"ghost"} className="hover:bg-red-50 hover:text-red-500">
                <Trash2 className="min-w-5 min-h-5" />
            </Button>
        )}
      </div>

      <Separator />

      <div className="mx-auto w-full max-w-4xl py-6">
        <FormProvider {...form}>
            <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full"
            >
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm p-4 md:p-8 rounded-2xl">
                <CardContent className="space-y-8 p-0">
                    {/* Job Details Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Job Details</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600 font-medium">Job Role/Position</FormLabel>
                                    <FormControl>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            className="pl-10 h-11 bg-white"
                                            disabled={loading}
                                            placeholder="e.g. Full Stack Developer"
                                            {...field}
                                        />
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600 font-medium">Years of Experience</FormLabel>
                                    <FormControl>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="number"
                                            className="pl-10 h-11 bg-white"
                                            disabled={loading}
                                            placeholder="e.g. 5"
                                            {...field}
                                        />
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="interviewType"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600 font-medium">Interview Type</FormLabel>
                                    <FormControl>
                                    <div className="relative group">
                                         <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                                         <select
                                            className="flex h-11 w-full rounded-md border border-input bg-white pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                            disabled={loading}
                                            {...field}
                                        >
                                            <option value="Technical">Technical Proficiency</option>
                                            <option value="Behavioral">Behavioral / Leadership</option>
                                            <option value="HR">HR / Culture Fit</option>
                                            <option value="Case">Case Study / System Design</option>
                                        </select>
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-600 font-medium">Job Description</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Textarea
                                            className="min-h-[120px] pl-10 pt-3 bg-white resize-none"
                                            disabled={loading}
                                            placeholder="Paste the job description or describe the role..."
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    
                    <Separator />
                    
                    {/* Tech Stack Section */}
                    <div className="space-y-6">
                         <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Code2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Technical Requirements</h3>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="techStack"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-600 font-medium">Tech Stack</FormLabel>
                                <FormControl>
                                <div className="relative">
                                    <Code2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Textarea
                                        className="h-24 pl-10 pt-3 bg-white resize-none"
                                        disabled={loading}
                                        placeholder="e.g. React, TypeScript, Node.js, AWS, PostgreSQL..."
                                        {...field}
                                    />
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="resume"
                            render={({ field }) => (
                            <FormItem>
                                 <div className="flex items-center gap-2 mb-2">
                                     <FormLabel className="text-gray-600 font-medium">Resume Context</FormLabel>
                                     <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
                                 </div>
                                <FormControl>
                                <div className="space-y-4">
                                     {/* File Upload UI */}
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="relative w-full">
                                            <Input 
                                                type="file" 
                                                accept=".pdf,.docx,.txt"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="resume-upload"
                                                disabled={isParsing || loading}
                                            />
                                            <FormLabel 
                                                htmlFor="resume-upload"
                                                className={cn(
                                                    "flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                                                    isParsing ? "border-primary/50 bg-primary/5" : "border-gray-300"
                                                )}
                                            >
                                                {isParsing ? (
                                                    <>
                                                        <Loader className="w-4 h-4 animate-spin text-primary" />
                                                        <span className="text-primary font-medium">Parsing Resume...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600 font-medium">Upload PDF/DOCX</span>
                                                    </>
                                                )}
                                            </FormLabel>
                                        </div>
                                    </div>

                                    <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Textarea
                                        className="h-48 pl-10 pt-3 bg-white resize-none"
                                        disabled={loading}
                                        placeholder="Paste your resume text here to personalize the questions..."
                                        {...field}
                                    />
                                </div>
                                </div>
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Why? The AI will use your resume to ask specific questions about your past projects and experience.
                                </p>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <div className="flex items-center gap-4">
                            <Button
                            type="reset"
                            variant={"ghost"}
                            disabled={isSubmitting || loading}
                            className="text-gray-500 hover:text-gray-800"
                            onClick={() => form.reset()}
                            >
                            Reset
                            </Button>
                            <Button
                            type="submit"
                            size={"lg"}
                            disabled={isSubmitting || !isValid || loading}
                            className="shadow-md hover:shadow-lg transition-all"
                            >
                            {loading ? (
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="w-5 h-5 mr-2" />
                            )}
                            {actions}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            </form>
        </FormProvider>
      </div>
    </div>
  );
};
