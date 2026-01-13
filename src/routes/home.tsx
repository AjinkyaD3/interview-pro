import { Sparkles } from "lucide-react";
import Marquee from "react-fast-marquee";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { MarqueImg } from "@/components/marquee-img";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container>
        <div className="my-8">
          <h2 className="text-3xl text-center md:text-left md:text-6xl">
            <span className="gradient-text font-extrabold md:text-8xl">
              AI Superpower
            </span>
            <span className="text-muted-foreground font-extrabold">
              - A better way to
            </span>
            <br />
            improve your interview chances and skills
          </h2>

          <p className="mt-4 text-muted-foreground text-sm max-w-2xl">
            Boost your interview skills and increase your success rate with
            AI-driven insights. Discover a smarter way to prepare, practice, and
            stand out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Stats Section */}
          {/* Text Section */}
          <div className="flex flex-col gap-6 items-center md:items-start text-center md:text-left md:order-1">
             <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                 Your Personal AI Interview Coach
            </h3>
             <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Real-time audio feedback</span>
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Personalized roadmap</span>
                </li>
                 <li className="flex items-center gap-2 justify-center md:justify-start">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>1000+ Tech Questions</span>
                </li>
             </ul>

            <Link to={"/generate"} className="w-full md:w-fit mt-6">
                <Button size={"lg"} className="w-full md:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all bg-gradient-to-r from-primary to-purple-600 border-0">
                  Get Started for Free <Sparkles className="ml-2 w-4 h-4" />
                </Button>
            </Link>
          </div>

          {/* Image Section */}
          <div className="w-full rounded-2xl bg-gray-100 dark:bg-neutral-900 h-[420px] shadow-2xl overflow-hidden relative md:order-2 border-4 border-white dark:border-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-800">
            <img
              src="/assets/img/hero.jpg"
              alt="Hero"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-md shadow-sm">
              <span className="font-semibold text-sm">Inteviews Copilot&copy;</span>
            </div>

            <div className="hidden md:block absolute w-80 bottom-4 right-4 px-5 py-4 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-lg border border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                      <h2 className="text-neutral-900 dark:text-neutral-100 font-semibold text-sm">Developer Assistant</h2>
                      <p className="text-xs text-neutral-500">Ready to help</p>
                  </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                "I can help you practice for your upcoming technical interviews with realistic AI-generated questions."
              </p>

              <Button size={"sm"} className="mt-4 w-full text-xs">
                Try Now
              </Button>
            </div>
          </div>
        </div>
      </Container>
      
      {/* marquee section */}
      <div className=" w-full my-16 bg-muted/30 py-8">
        <Marquee pauseOnHover gradient={false} speed={40}>
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/zoom.png" />
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/tailwindcss.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
        </Marquee>
      </div>

      <Container className="py-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
             <h2 className="tracking-tight text-3xl md:text-5xl font-bold">
              Unleash your potential
            </h2>
            <p className="text-lg text-muted-foreground">
                Personalized AI insights and targeted interview practice to help you land your dream job.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl overflow-hidden h-80 relative group">
            <img
              src="/assets/img/office.jpg"
              alt="Office"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <h3 className="text-white text-2xl font-bold">Realistic Environments</h3>
            </div>
          </div>

          <div className="rounded-2xl bg-primary/5 dark:bg-primary/10 p-8 flex flex-col items-center justify-center text-center gap-6 border border-primary/10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                 <Sparkles className="w-8 h-8 text-primary" />
            </div>
            
            <p className="text-lg font-medium text-foreground">
              "Transform the way you prepare. Gain confidence and boost your chances."
            </p>

            <Link to={"/generate"} className="w-full max-w-xs">
              <Button className="w-full shadow-md">
                Generate Interview <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
