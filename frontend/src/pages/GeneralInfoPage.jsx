import { useLocation } from 'react-router-dom';
import { Shield, Lock, FileText, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const GeneralInfoPage = () => {
  const { pathname } = useLocation();
  const type = pathname.split('/').pop().replace(/-/g, ' ');

  const getContent = () => {
    switch (pathname) {
      case '/terms-conditions':
        return {
          icon: <FileText size={48} className="text-accent" />,
          title: "Terms & Conditions",
          desc: "By using Fixit, you agree to our premium service standards and community guidelines.",
          sections: [
            { h: "1. Service Standards", p: "We guarantee the highest quality of home maintenance through our verified network of elite professionals." },
            { h: "2. Booking Policy", p: "Secure bookings are final once confirmed. Rescheduling is available up to 24 hours before the service time." },
            { h: "3. Professional Conduct", p: "Our experts are committed to precision, punctuality, and respect for your premium space." }
          ]
        };
      case '/privacy-policy':
        return {
          icon: <Lock size={48} className="text-accent" />,
          title: "Privacy Policy",
          desc: "Your data privacy is our priority. We use advanced encryption to secure your personal information.",
          sections: [
            { h: "1. Data Security", p: "All user information is stored in encrypted databases with restricted administrative access." },
            { h: "2. Usage Information", p: "We only collect data necessary for providing and improving our luxury maintenance experience." },
            { h: "3. Third-party Sharing", p: "We never sell your data. Information is only shared with assigned professionals to fulfill your request." }
          ]
        };
      case '/about-us':
        return {
          icon: <Info size={48} className="text-accent" />,
          title: "About Fixit",
          desc: "Reimagining home maintenance with luxury, precision, and verified expertise.",
          sections: [
            { h: "Our Mission", p: "To provide homeowners with the 'Gold Standard' of home services through technology and elite craftsmanship." },
            { h: "The Fixit Standard", p: "Every professional undergoes a rigorous multi-step background and skill verification process." }
          ]
        };
      default:
        return {
          icon: <Shield size={48} className="text-accent" />,
          title: "Fixit Support",
          desc: "Providing you with the safety and support you deserve.",
          sections: [
            { h: "Safety Measures", p: "Background verified experts and insured services for your peace of mind." },
            { h: "Contact Support", p: "Reach out to us via email or WhatsApp for any assistance regarding your premium experience." }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div style={{ padding: '8rem 0', background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/" className="btn btn-outline" style={{ marginBottom: '3rem', width:'auto', display:'inline-flex' }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="reveal-up">
           <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
             {content.icon}
           </div>
           <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>{content.title}</h1>
           <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: 600, margin: '0 auto' }}>{content.desc}</p>
        </div>

        <div className="reveal-up" style={{ display: 'grid', gap: '3rem' }}>
          {content.sections.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color:'white' }}>{s.h}</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.8 }}>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoPage;
