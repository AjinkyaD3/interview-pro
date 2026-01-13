import React from "react";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"; // Import Lucide icons
import { Link } from "react-router-dom";
import { Container } from "@/components/container";
import { MainRoutes } from "@/lib/helpers";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, hoverColor }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`hover:${hoverColor}`}
    >
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => {
  return (
    <li>
      <Link
        to={to}
        className="hover:underline text-gray-300 hover:text-gray-100"
      >
        {children}
      </Link>
    </li>
  );
};

export const Footer = () => {
  return (
    <div className="w-full bg-neutral-950 text-neutral-400 py-12 border-t border-neutral-900">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                 </div>
                 <h3 className="font-bold text-xl text-neutral-100">Interview Pro</h3>
             </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering developers to crack their dream interviews with AI-driven mock sessions and real-time feedback.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialLink
                href="https://facebook.com"
                icon={<Facebook size={20} />}
                hoverColor="text-blue-500"
              />
              <SocialLink
                href="https://twitter.com"
                icon={<Twitter size={20} />}
                hoverColor="text-blue-400"
              />
              <SocialLink
                href="https://instagram.com"
                icon={<Instagram size={20} />}
                hoverColor="text-pink-500"
              />
              <SocialLink
                href="https://linkedin.com"
                icon={<Linkedin size={20} />}
                hoverColor="text-blue-700"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-neutral-100 text-lg mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              {MainRoutes.map((route) => (
                <FooterLink key={route.href} to={route.href}>
                  {route.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
             <h3 className="font-bold text-neutral-100 text-lg mb-4">Resources</h3>
             <ul className="space-y-3 text-sm">
                <FooterLink to="/services/interview-prep">Interview Guide</FooterLink>
                <FooterLink to="/services/career-coaching">Career Roadmap</FooterLink>
                <FooterLink to="/services/resume-building">Resume Builder</FooterLink>
                <FooterLink to="/pricing">Pricing</FooterLink>
             </ul>
          </div>
          
           {/* Newsletter / Contact */}
           <div className="space-y-4">
              <h3 className="font-bold text-neutral-100 text-lg">Stay Updated</h3>
              <p className="text-sm">Join our newsletter for the latest interview tips.</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter email" 
                    className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                      Subscribe
                  </button>
              </form>
           </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>&copy; {new Date().getFullYear()} Interview Pro. All rights reserved.</p>
            <div className="flex gap-6">
                <Link to="#" className="hover:text-neutral-300">Privacy Policy</Link>
                <Link to="#" className="hover:text-neutral-300">Terms of Service</Link>
            </div>
        </div>
      </Container>
    </div>
  );
};
