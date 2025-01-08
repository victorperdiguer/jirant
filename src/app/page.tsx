import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Brain, Sparkles, Link2, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center space-x-2">
              <Badge className="px-4 py-1">
                Jira'nt - AI-Powered PM Assistant
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Meet Jira'nt, your
              <span className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground px-4 mx-2 rounded-md">
                smarter
              </span>
              PM companion
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Stop wrestling with Jira. Let Jira'nt handle the tedious parts of product management while you focus on what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8">
                See it in Action
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Jira'nt?</h2>
            <p className="text-muted-foreground">Everything you need to manage products effectively</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="border-2">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple pricing, powerful features</h2>
            <p className="text-muted-foreground">Choose the plan that works for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <Card key={i} className={`border-2 ${plan.featured ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.featured ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-muted">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your product management with Jira'nt?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join product managers who are shipping better products faster with Jira'nt.
          </p>
          <Button size="lg" className="h-12 px-8">
            Try Jira'nt Free
          </Button>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "AI-Powered Ticket Writing",
    description: "Transform your thoughts into well-structured tickets, user stories, and epics automatically."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Voice-to-Ticket",
    description: "Dictate your ideas on the go. We'll convert them into properly formatted tickets."
  },
  {
    icon: <Link2 className="h-8 w-8 text-primary" />,
    title: "Smart Context Linking",
    description: "Automatically link related tickets to maintain context and improve team understanding."
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "Time Saver",
    description: "Reduce ticket writing time by 80% and focus on strategic product decisions."
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "AI Enhancement",
    description: "Improve ticket quality with AI-powered suggestions and refinements."
  }
];

const pricingPlans = [
  {
    name: "Monthly",
    description: "Perfect for individual PMs",
    price: 5.99,
    period: "/month",
    featured: false,
    features: [
      "All AI-powered features",
      "Unlimited tickets",
      "Voice-to-ticket conversion",
      "Smart context linking",
      "Basic analytics"
    ]
  },
  {
    name: "Yearly",
    description: "Best value for committed users",
    price: 50,
    period: "/year",
    featured: true,
    features: [
      "Everything in Monthly",
      "Save $21.88 yearly",
      "Priority support",
      "Advanced analytics",
      "Early access to new features"
    ]
  },
  {
    name: "Lifetime",
    description: "One-time payment forever",
    price: 150,
    period: " one-time",
    featured: false,
    features: [
      "Everything in Yearly",
      "Never pay again",
      "Lifetime updates",
      "VIP support",
      "Feature request priority"
    ]
  }
];