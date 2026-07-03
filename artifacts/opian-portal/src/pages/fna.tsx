import { useState } from "react";
import { useCreateFnaSubmission, getListFnaSubmissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const fnaSchema = z.object({
  clientName: z.string().min(2, "Full name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientPhone: z.string().min(10, "Valid phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  idNumber: z.string().min(13, "Valid ID number is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  dependants: z.coerce.number().min(0),
  
  employmentStatus: z.string().min(1, "Employment status is required"),
  monthlyIncome: z.coerce.number().min(1, "Monthly income must be greater than 0"),
  monthlyExpenses: z.coerce.number().min(1, "Monthly expenses must be greater than 0"),
  
  totalAssets: z.coerce.number().min(0, "Total assets cannot be negative"),
  totalLiabilities: z.coerce.number().min(0, "Total liabilities cannot be negative"),
  
  hasLifeCover: z.boolean().default(false),
  hasDisabilityCover: z.boolean().default(false),
  hasRetirementFund: z.boolean().default(false),
  hasInvestments: z.boolean().default(false),
  
  riskTolerance: z.string().min(1, "Risk tolerance is required"),
  financialGoals: z.string().min(10, "Please provide detailed goals"),
  notes: z.string().optional(),
});

const steps = [
  { id: "personal", title: "Personal Details" },
  { id: "financials", title: "Income & Assets" },
  { id: "cover", title: "Existing Cover" },
  { id: "goals", title: "Goals & Risk" }
];

export default function FnaForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateFnaSubmission();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<z.infer<typeof fnaSchema>>({
    resolver: zodResolver(fnaSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      dateOfBirth: "",
      idNumber: "",
      maritalStatus: "",
      dependants: 0,
      employmentStatus: "",
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      hasLifeCover: false,
      hasDisabilityCover: false,
      hasRetirementFund: false,
      hasInvestments: false,
      riskTolerance: "",
      financialGoals: "",
      notes: "",
    },
  });

  const onSubmit = (data: z.infer<typeof fnaSchema>) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFnaSubmissionsQueryKey() });
          toast({
            title: "FNA Submitted",
            description: "The Financial Needs Analysis has been saved successfully.",
          });
          setLocation("/fna/list");
        },
      }
    );
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fields as any);
    if (isValid) {
      setCurrentStep(s => Math.min(steps.length - 1, s + 1));
    }
  };

  const prevStep = () => setCurrentStep(s => Math.max(0, s - 1));

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0: return ["clientName", "clientEmail", "clientPhone", "dateOfBirth", "idNumber", "maritalStatus", "dependants"];
      case 1: return ["employmentStatus", "monthlyIncome", "monthlyExpenses", "totalAssets", "totalLiabilities"];
      case 2: return ["hasLifeCover", "hasDisabilityCover", "hasRetirementFund", "hasInvestments"];
      case 3: return ["riskTolerance", "financialGoals", "notes"];
      default: return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Financial Needs Analysis</h1>
        <p className="text-muted-foreground mt-1">Complete the form below to assess client needs</p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
        <div className="relative z-10 flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                ${index < currentStep ? 'bg-primary border-primary text-primary-foreground' : 
                  index === currentStep ? 'bg-background border-primary text-primary' : 
                  'bg-background border-muted text-muted-foreground'}`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`text-xs font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="clientName" render={({ field }) => (
                          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="idNumber" render={({ field }) => (
                          <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="YYMMDDXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clientEmail" render={({ field }) => (
                          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clientPhone" render={({ field }) => (
                          <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+27 82 000 0000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                          <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marital Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="Single">Single</SelectItem>
                                  <SelectItem value="Married">Married</SelectItem>
                                  <SelectItem value="Divorced">Divorced</SelectItem>
                                  <SelectItem value="Widowed">Widowed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="dependants" render={({ field }) => (
                            <FormItem><FormLabel>Dependants</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <FormField control={form.control} name="employmentStatus" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Employed">Employed (Full-time)</SelectItem>
                              <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                              <SelectItem value="Contractor">Contractor / Freelance</SelectItem>
                              <SelectItem value="Retired">Retired</SelectItem>
                              <SelectItem value="Unemployed">Unemployed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Gross Income (R)</FormLabel>
                            <FormControl><Input type="number" min="0" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="monthlyExpenses" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Living Expenses (R)</FormLabel>
                            <FormControl><Input type="number" min="0" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="totalAssets" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Total Assets (R)</FormLabel>
                            <FormControl><Input type="number" min="0" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="totalLiabilities" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Total Liabilities (R)</FormLabel>
                            <FormControl><Input type="number" min="0" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground mb-4">Check all that currently apply to the client.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="hasLifeCover" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Life Cover</FormLabel>
                              <FormDescription>Active life insurance policies</FormDescription>
                            </div>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="hasDisabilityCover" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Disability Cover</FormLabel>
                              <FormDescription>Income protection or disability</FormDescription>
                            </div>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="hasRetirementFund" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Retirement Fund</FormLabel>
                              <FormDescription>Pension, provident, or RA</FormDescription>
                            </div>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="hasInvestments" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Discretionary Investments</FormLabel>
                              <FormDescription>Unit trusts, shares, etc.</FormDescription>
                            </div>
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <FormField control={form.control} name="riskTolerance" render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Risk Tolerance</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="Conservative" /></FormControl>
                                <FormLabel className="font-normal">Conservative (Capital preservation focus)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="Moderate" /></FormControl>
                                <FormLabel className="font-normal">Moderate (Balanced growth and risk)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="Aggressive" /></FormControl>
                                <FormLabel className="font-normal">Aggressive (Maximum growth, high volatility)</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      <FormField control={form.control} name="financialGoals" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Financial Goals</FormLabel>
                          <FormControl>
                            <Textarea placeholder="E.g., Save for children's education, retire at 65..." className="h-24 resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Adviser Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any other relevant details for the analysis" className="h-20 resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-border pt-6 mt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={nextStep}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Submitting..." : (
                    <><Save className="mr-2 h-4 w-4 text-primary" /> Submit FNA</>
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
