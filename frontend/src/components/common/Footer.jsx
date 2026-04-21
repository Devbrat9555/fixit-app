import { Link } from 'react-router-dom';
import { Wrench, Mail, Phone, MapPin, Share2, Send, Globe, ExternalLink } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-white/5 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Wrench size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Fixit</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Your trusted home service marketplace. Connecting skilled professionals with homeowners across India.
            </p>
            <div className="flex gap-3">
              {[Share2, Send, Globe, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg glass-light flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Services', 'About Us', 'Contact', 'Blog'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              {['Electrical', 'Plumbing', 'Cleaning', 'Painting', 'Carpentry', 'AC Repair'].map((item) => (
                <li key={item}>
                  <Link to="/services" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin size={15} className="text-indigo-400 flex-shrink-0" />
                Mumbai, Maharashtra, India
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone size={15} className="text-indigo-400 flex-shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail size={15} className="text-indigo-400 flex-shrink-0" />
                support@fixit.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Fixit. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
