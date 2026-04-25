import {
  Users,
  Wallet,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Sparkles,
  Church,
  Shield,
  ArrowRight,
  Heart,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description:
      'Comprehensive member profiles with attendance tracking, family connections, spiritual gifts assessments, and engagement analytics to nurture your congregation.',
  },
  {
    icon: Wallet,
    title: 'Financial Stewardship',
    description:
      'Track tithes, offerings, and budgets with transparency. Generate financial reports, manage donations, and honor God with faithful stewardship.',
  },
  {
    icon: CalendarDays,
    title: 'Event Coordination',
    description:
      'Plan worship services, Bible studies, community outreach, and special events with integrated scheduling, volunteer management, and resource allocation.',
  },
  {
    icon: BookOpen,
    title: 'Ministry Tracking',
    description:
      'Organize and monitor all ministries — from youth groups to mission teams — with goal setting, progress reports, and impact measurement.',
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description:
      'Send announcements, newsletters, prayer requests, and pastoral care messages through email, SMS, and push notifications from one central platform.',
  },
  {
    icon: Sparkles,
    title: 'Yeshua AI Assistant',
    description:
      'A biblical wisdom chatbot trained on systematic theology, doctrine, and Scripture — providing instant theological answers and spiritual guidance.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Church className="h-7 w-7 text-amber-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Covenant<span className="text-amber-600">ERP</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-gray-900 transition-colors">
              About
            </a>
            <button className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Built for the Body of Christ
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Transforming Church Management{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                with Divine Purpose
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100/80 leading-relaxed max-w-2xl">
              CovenantERP empowers churches to shepherd their congregations with
              wisdom, organize ministries with excellence, and steward resources
              with faithfulness — all from one integrated platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all">
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
              Everything You Need
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              One Platform for Every Ministry Need
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              From membership to finances, events to AI-powered biblical guidance
              — CovenantERP covers every aspect of church administration.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 lg:p-8 rounded-2xl border border-gray-100 bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-5">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
                About CovenantERP
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Rooted in Faith, Built for Service
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed">
                CovenantERP was born from a vision to equip the modern church with
                tools that honor God and serve His people. We believe that church
                administration should be a ministry — not a burden.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Our platform integrates cutting-edge technology with biblical
                principles, providing church leaders with everything they need to
                manage their congregations effectively. From tracking member
                engagement to powering AI-assisted biblical guidance, every feature
                is designed to help the church fulfill its divine mission.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Whether you lead a small fellowship or a thriving megachurch,
                CovenantERP scales with your needs — so you can focus on what
                matters most: shepherding hearts and making disciples.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Heart className="h-4 w-4 text-amber-500" />
                  Faith-driven design
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Shield className="h-4 w-4 text-amber-500" />
                  Secure & private
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-100 to-blue-50 rounded-3xl blur-2xl opacity-60" />
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-slate-900 to-blue-950 p-8 sm:p-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">2,500+</p>
                      <p className="text-blue-200 text-sm">Active Members Managed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">$1.2M+</p>
                      <p className="text-blue-200 text-sm">Stewardship Tracked</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">850+</p>
                      <p className="text-blue-200 text-sm">Events Coordinated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">10,000+</p>
                      <p className="text-blue-200 text-sm">AI Questions Answered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ready to Equip Your Ministry?
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            Join hundreds of churches that are already using CovenantERP to
            manage their congregations with excellence and grace.
          </p>
          <button className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold text-sm shadow-lg hover:from-slate-800 hover:to-slate-700 transition-all">
            Get Started for Free
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Church className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-semibold text-gray-700">
                CovenantERP
              </span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} CovenantERP. All rights reserved.
              Built with faith and purpose.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
