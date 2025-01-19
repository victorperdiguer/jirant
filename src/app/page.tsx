'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Brain, Link2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/workspace');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center space-x-2">
              {logo}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Meet <span className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Jira&apos;nt</span>, your
              <span className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground px-4 mx-2 rounded-md">
                smarter
              </span>
              PM companion
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Let Jira&apos;nt handle the tedious parts of product management while you focus on what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="h-12 px-8"
                onClick={handleStartClick}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-8"
                onClick={handleStartClick}
              >
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
            <h2 className="text-3xl font-bold mb-4">Why Jira&apos;nt?</h2>
            <p className="text-muted-foreground">Everything you need to manage products effectively</p>
          </div>
{/*           <div className="flex flex-row flex-wrap justify-center gap-8">
 */}          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

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
                  <Button 
                    className="w-full mt-6" 
                    variant={plan.featured ? "default" : "outline"}
                    onClick={handleStartClick}
                  >
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
          <h2 className="text-3xl font-bold mb-4">Ready to transform your product management with Jira&apos;nt?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join product managers who are shipping better products faster with Jira&apos;nt.
          </p>
          <Button 
            size="lg" 
            className="h-12 px-8"
            onClick={handleStartClick}
          >
            Try Jira&apos;nt Free
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
/*   {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "Time Saver",
    description: "Reduce ticket writing time by 80% and focus on strategic product decisions."
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "AI Enhancement",
    description: "Improve ticket quality with AI-powered suggestions and refinements."
  } */
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

const logo = <svg 
width="50" 
height="67" 
viewBox="0 0 50 67" 
className="w-24 h-32 transform transition-transform duration-500 ease-out group-hover:scale-110"
>
<path 
  d="M30 39V43C30 46.713 28.525 50.274 25.8995 52.8995C23.274 55.525 19.713 57 16 57M16 57C12.287 57 8.72601 55.525 6.1005 52.8995C3.475 50.274 2 46.713 2 43V39M16 57V65M8 65H24M16 21C14.4087 21 12.8826 21.6321 11.7574 22.7574C10.6321 23.8826 10 25.4087 10 27V43C10 44.5913 10.6321 46.1174 11.7574 47.2426C12.8826 48.3679 14.4087 49 16 49C17.5913 49 19.1174 48.3679 20.2426 47.2426C21.3679 46.1174 22 44.5913 22 43V27C22 25.4087 21.3679 23.8826 20.2426 22.7574C19.1174 21.6321 17.5913 21 16 21Z" 
  className="stroke-primary"
  strokeWidth="4" 
  strokeLinecap="round" 
  strokeLinejoin="round"
/>
<path 
  d="M48.7569 2.57091L34.5159 0.0824919C33.8974 3.62218 36.2751 7.00676 39.8148 7.62527L42.4489 8.08556L42.0102 10.5963C41.3917 14.136 43.7694 17.5205 47.3091 18.139L49.776 4.02145C49.8982 3.32174 49.4155 2.68599 48.7569 2.57091Z" 
  className="fill-primary"
/>
<path 
  d="M40.4818 8.42051L26.2407 5.93208C25.6222 9.47177 27.9999 12.8564 31.5396 13.4749L34.1738 13.9351L33.7279 16.487C33.1094 20.0267 35.4871 23.4113 39.0268 24.0298L41.4936 9.9122C41.6159 9.21249 41.1403 8.53558 40.4818 8.42051Z" 
  className="fill-primary opacity-80"
/>
<path 
  d="M32.2064 14.27L17.9653 11.7816C17.3468 15.3213 19.7245 18.7059 23.2642 19.3244L25.8572 19.7775L25.4185 22.2882C24.8 25.8279 27.1777 29.2125 30.7174 29.831L33.1915 15.6722C33.3405 15.062 32.8649 14.3851 32.2064 14.27Z" 
  className="fill-primary opacity-60"
/>
</svg>