import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export const ContactUsPage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container className="py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="tracking-tight text-3xl md:text-5xl font-bold">
            Contact Us
          </h2>
          <p className="text-lg text-muted-foreground">
            We'd love to hear from you. Get in touch with us!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold">Get in touch</h3>
            
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold">Visit Us</h4>
                    <p className="text-muted-foreground">123 AI Street, Tech City, 12345</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold">Email Us</h4>
                    <p className="text-muted-foreground">support@interviewpro.ai</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold">Call Us</h4>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 rounded-xl border bg-card shadow-sm space-y-6">
            <h3 className="text-xl font-bold">Send a Message</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input placeholder="John" />
                    </div>
                    <div className="space-y-2">
                         <label className="text-sm font-medium">Last Name</label>
                        <Input placeholder="Doe" />
                    </div>
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium">Email</label>
                    <Input placeholder="john@example.com" type="email" />
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium">Message</label>
                    <Textarea placeholder="How can we help you?" />
                </div>
                <Button className="w-full">Send Message</Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
