import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, FileText, Brain, Zap, Play, Star } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-primary rounded-full opacity-15 blur-3xl animate-floating"></div>
        <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-accent rounded-full opacity-12 blur-3xl animate-floating-delayed"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-secondary rounded-full opacity-8 blur-3xl animate-floating"></div>
        
        {/* Secondary Effects */}
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-warm rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-gradient-cool rounded-full opacity-25 blur-xl animate-pulse"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-primary rounded-full animate-floating opacity-60"></div>
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-accent rounded-full animate-floating-delayed opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-primary-light rounded-full animate-floating opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Enhanced Badge */}
        <div className="inline-flex items-center px-6 py-3 rounded-full glass-card-strong mb-8 group hover:scale-105 transition-all duration-300 border border-primary/20 hover:border-primary/40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Transform PDFs with AI Magic
            </span>
            <Zap className="w-4 h-4 text-accent" />
          </div>
        </div>

        {/* Enhanced Main Heading */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 leading-none tracking-tight">
            Turn Static{' '}
            <span className="gradient-text animate-gradient-shift">PDFs</span>
          </h1>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight">
            Into Interactive{' '}
            <span className="gradient-text-accent">Knowledge</span>
          </h1>
        </div>

        {/* Enhanced Subheading */}
        <p className="text-xl md:text-2xl lg:text-3xl text-foreground-secondary mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
          Upload any PDF and unlock its potential with{' '}
          <span className="text-primary font-semibold">AI-powered chat</span>,{' '}
          <span className="text-accent font-semibold">smart summaries</span>, and{' '}
          <span className="text-primary-light font-semibold">interactive tools</span>.
          <br className="hidden md:block" />
          Your documents have never been this intelligent.
        </p>

        {/* Enhanced CTA Section */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="btn-gradient text-lg px-10 py-6 h-auto group font-semibold shadow-glow hover:shadow-glow-accent transition-all duration-300"
          >
            <Star className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Start Building Knowledge
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-10 py-6 h-auto glass-card-strong hover:bg-primary/10 border-primary/30 hover:border-primary/60 group font-semibold"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Watch Demo
          </Button>
        </div>

        {/* Enhanced Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass-card-strong p-8 card-hover group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">Smart Upload</h3>
              <p className="text-foreground-secondary leading-relaxed">
                Drag, drop, and instantly transform any PDF into an interactive knowledge base with advanced AI processing.
              </p>
            </div>
          </div>
          
          <div className="glass-card-strong p-8 card-hover group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-accent transition-colors">AI Conversations</h3>
              <p className="text-foreground-secondary leading-relaxed">
                Chat naturally with your documents. Ask questions, get insights, and discover hidden connections.
              </p>
            </div>
          </div>
          
          <div className="glass-card-strong p-8 card-hover group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary-light transition-colors">AI Studio Tools</h3>
              <p className="text-foreground-secondary leading-relaxed">
                Generate summaries, quizzes, mind maps, and FAQs with cutting-edge AI capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-foreground-tertiary">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Free tier available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Enterprise-grade security</span>
          </div>
        </div>
      </div>
    </section>
  );
};