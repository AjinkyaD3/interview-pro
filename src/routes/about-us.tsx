import { Container } from "@/components/container";
import { Sparkles } from "lucide-react";

export const AboutUsPage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container className="py-12 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="tracking-tight text-3xl md:text-5xl font-bold">
            About Us
          </h2>
          <p className="text-lg text-muted-foreground">
            Empowering your career journey with AI-driven insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-12">
            <div className="space-y-6">
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                    At Interview Pro, we believe that everyone deserves a fair chance to land their dream job. 
                    Technical interviews can be daunting, and traditional preparation methods often lack the 
                    personalized feedback needed to improve.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    Our mission is to democratize interview preparation by leveraging advanced AI to provide
                    realistic mock interviews, instant detailed feedback, and actionable insights to help you
                    grow as a developer and a professional.
                </p>
                
                <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="text-primary w-5 h-5"/>
                    <span>AI-Powered Precision</span>
                </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-xl border bg-card">
                 <img src="/assets/img/office.jpg" alt="Our Team" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
            </div>
        </div>
      </Container>
    </div>
  );
};
