const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="spinner"></div>
    <p className="text-slate-400 text-sm">{text}</p>
  </div>
);

export default Loader;
