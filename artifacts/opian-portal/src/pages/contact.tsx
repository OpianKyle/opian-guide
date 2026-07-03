import { useListAdvisors } from "@workspace/api-client-react";
import { Mail, Phone, MapPin, Building, GraduationCap, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { data: advisors, isLoading } = useListAdvisors();
  const { toast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Your advisor will get back to you shortly.",
    });
  };

  const primaryAdvisor = advisors?.[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Contact Adviser</h1>
        <p className="text-muted-foreground mt-1">Get in touch with your dedicated financial expert</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {isLoading ? (
            <Card className="h-[400px]">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto mt-4" />
                <Skeleton className="h-4 w-32 mx-auto mt-2" />
                <div className="mt-8 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : primaryAdvisor ? (
            <Card className="bg-sidebar text-sidebar-foreground border-none shadow-md overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sidebar-primary/20 rounded-bl-full -mr-10 -mt-10" />
              <CardHeader className="text-center pt-8">
                <div className="mx-auto h-24 w-24 rounded-full bg-sidebar-primary/20 flex items-center justify-center font-bold text-3xl text-sidebar-primary border-4 border-sidebar-primary/30 mb-2">
                  {primaryAdvisor.initials}
                </div>
                <CardTitle className="text-2xl font-serif mt-2">{primaryAdvisor.name}</CardTitle>
                <p className="text-sidebar-primary text-sm font-medium">{primaryAdvisor.title}</p>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                    <Phone className="h-4 w-4 text-sidebar-primary" />
                    <span>{primaryAdvisor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                    <Mail className="h-4 w-4 text-sidebar-primary" />
                    <span>{primaryAdvisor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                    <Building className="h-4 w-4 text-sidebar-primary" />
                    <span>Opian NFS Group</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                    <MapPin className="h-4 w-4 text-sidebar-primary" />
                    <span>Sandton, South Africa</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 mt-4">
                  <p className="text-xs uppercase tracking-wider text-sidebar-foreground/50 mb-3 font-semibold">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {primaryAdvisor.specializations.map(spec => (
                      <span key={spec} className="bg-white/10 px-2 py-1 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border h-full">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Send a Message</CardTitle>
              <CardDescription>Send a direct message securely to your adviser's inbox.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="What is this regarding?" className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option>Policy Question</option>
                      <option>New Investment</option>
                      <option>Schedule Meeting</option>
                      <option>Update Details</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Write your message here..." 
                    className="min-h-[200px] bg-white resize-none"
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
