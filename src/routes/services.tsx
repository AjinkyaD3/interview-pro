import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FileText, Mic } from "lucide-react";
import { Link } from "react-router-dom";

export const ServicesPage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container className="py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="tracking-tight text-3xl md:text-5xl font-bold">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive tools to supercharge your interview preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Service 1 */}
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Mock Interviews</h3>
                <p className="text-muted-foreground">
                    Practice with realistic AI-driven voice interviews tailored to your job description and tech stack.
                </p>
            </div>

            {/* Service 2 */}
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">AI Feedback</h3>
                <p className="text-muted-foreground">
                    Get instant, granular feedback on your answers, including rating on correctness, clarity, and confidence.
                </p>
            </div>

             {/* Service 3 */}
             <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Resume Building</h3>
                <p className="text-muted-foreground">
                    Coming soon: Create ATS-friendly resumes optimized for your target roles using our AI builder.
                </p>
            </div>
        </div>

        <div className="flex justify-center mt-12">
            <Link to="/generate">
                <Button size="lg">Start Practicing Now</Button>
            </Link>
        </div>
      </Container>
    </div>
  );
};
