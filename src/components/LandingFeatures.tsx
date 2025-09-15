import { MessageSquare, FileText, Brain, Map, HelpCircle, Volume2, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: "Intelligent Chat",
    description: "Have natural conversations with your PDFs. Ask questions, get detailed answers, and explore content interactively.",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    icon: Brain,
    title: "AI-Powered Summaries",
    description: "Generate comprehensive summaries that capture key insights and main points from complex documents.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: Map,
    title: "Visual Mind Maps",
    description: "Transform document structure into beautiful, interactive mind maps for better understanding.",
    gradient: "from-pink-500 to-red-600",
  },
  {
    icon: HelpCircle,
    title: "Smart Quizzes",
    description: "Auto-generate quizzes and assessments to test comprehension and reinforce learning.",
    gradient: "from-green-500 to-blue-600",
  },
  {
    icon: FileText,
    title: "Multi-Document Analysis",
    description: "Compare, contrast, and analyze multiple PDFs simultaneously for comprehensive insights.",
    gradient: "from-yellow-500 to-green-600",
  },
  {
    icon: Volume2,
    title: "Audio Overviews",
    description: "Listen to AI-generated audio summaries for hands-free learning and accessibility.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Collaboration Ready",
    description: "Share notebooks, collaborate on insights, and build knowledge together with your team.",
    gradient: "from-teal-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your documents are processed securely with enterprise-grade encryption and privacy protection.",
    gradient: "from-gray-500 to-blue-600",
  },
];

export const LandingFeatures = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for{' '}
            <span className="gradient-text">Smart Learning</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to transform static documents into dynamic, interactive knowledge experiences.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-card p-8 card-hover group relative overflow-hidden"
              >
                {/* Gradient background effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="glass-card p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to revolutionize how you work with documents?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of professionals who've already transformed their PDF workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-muted-foreground">
                ✨ No credit card required • 🚀 Free tier available • 🔒 100% secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};