import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Student Enrollment & Profiles',
      description: 'Comprehensive student management with profiles, enrollment tracking, and academic records.'
    },
    {
      title: 'Academic & Curriculum Management',
      description: 'Design and manage theological curricula, courses, and academic programs seamlessly.'
    },
    {
      title: 'Faculty & Teaching Tools',
      description: 'Empower faculty with dedicated portals for course management and student engagement.'
    },
    {
      title: 'Theological Library System',
      description: 'Digital library management for theological resources, books, and research materials.'
    },
    {
      title: 'Billing & Sponsorship Tracking',
      description: 'Complete financial management with billing, payments, and sponsorship tracking.'
    },
    {
      title: 'Pedagogical Portal',
      description: 'Lesson planning, engagement tracking, and ministry training management tools.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: '$29',
      features: ['Up to 100 students', 'Basic student management', 'Academic system', 'Email support']
    },
    {
      name: 'Pro',
      price: '$79',
      features: ['Up to 500 students', 'All Basic features', 'Library management', 'Faculty portal', 'Priority support'],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      features: ['Unlimited students', 'All Pro features', 'White-label branding', 'Multi-campus support', 'Dedicated support']
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Run Your Entire Theological Institution on One Platform</h1>
          <p>Manage students, faculty, academics, library, finance, and ministry training — all in one secure ERP.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/onboarding')}>Get Started</button>
            <button className="btn-secondary">Request Demo</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="dashboard-mockup">Dashboard Preview</div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-section">
        <h2>Built for Seminaries & Bible Colleges</h2>
        <div className="modules-grid">
          <div className="module-card">Student Management</div>
          <div className="module-card">Academic System</div>
          <div className="module-card">Faculty Portal</div>
          <div className="module-card">Library</div>
          <div className="module-card">Finance</div>
          <div className="module-card">Pedagogical Portal</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Everything You Need to Run Your Institution</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Unique Value Section */}
      <section className="value-section">
        <h2>What Makes CovenantERP Different</h2>
        <div className="value-grid">
          <div className="value-item">
            <h3>Theology-Focused System</h3>
            <p>Built specifically for theological education, not a generic ERP</p>
          </div>
          <div className="value-item">
            <h3>Ministry & Spiritual Tracking</h3>
            <p>Track spiritual growth, ministry involvement, and practical training</p>
          </div>
          <div className="value-item">
            <h3>Multi-Institution SaaS</h3>
            <p>Super Admin control for managing multiple institutions</p>
          </div>
          <div className="value-item">
            <h3>White-Label Branding</h3>
            <p>Customize the platform with your institution's branding</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Institution</h3>
            <p>Sign up and set up your institution profile</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Configure Academic & Faculty</h3>
            <p>Add courses, programs, and faculty members</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Managing & Teaching</h3>
            <p>Enroll students and begin operations</p>
          </div>
        </div>
      </section>

      {/* Screens Preview */}
      <section className="screens-preview">
        <h2>See CovenantERP in Action</h2>
        <div className="tabs">
          <button className="tab active">Dashboard</button>
          <button className="tab">Library Portal</button>
          <button className="tab">Academic System</button>
          <button className="tab">Pedagogical Portal</button>
        </div>
        <div className="screen-mockup">
          <p>Screen Preview Content Here</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Trusted by Institutions Worldwide</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"CovenantERP has transformed how we manage our seminary. Everything is in one place."</p>
            <div className="stars">★★★★★</div>
            <p className="author">- Seminary Administrator</p>
          </div>
          <div className="testimonial-card">
            <p>"The theology-focused features make this perfect for our Bible college."</p>
            <div className="stars">★★★★★</div>
            <p className="author">- Bible College President</p>
          </div>
          <div className="testimonial-card">
            <p>"Faculty love the teaching tools and student engagement features."</p>
            <div className="stars">★★★★★</div>
            <p className="author">- Dean of Students</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <h2>Choose Your Plan</h2>
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
              <h3>{plan.name}</h3>
              <div className="price">{plan.price}<span>/month</span></div>
              <ul>
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex}>{feature}</li>
                ))}
              </ul>
              <button className="btn-primary">Start Free Trial</button>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Start Your Institution's Digital Transformation Today</h2>
        <button className="btn-primary" onClick={() => navigate('/onboarding')}>Get Started</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <p>&copy; 2026 CovenantERP. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
