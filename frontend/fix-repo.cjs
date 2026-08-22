const fs = require('fs');

let c = fs.readFileSync('src/pages/RepoAnalysis.tsx', 'utf8');

// Add state
if (!c.includes('isMobileMenuOpen')) {
  c = c.replace(/const \[activeTab, setActiveTab\] = useState/, 'const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const [activeTab, setActiveTab] = useState');
}

// Add mobile menu button in header
if (!c.includes('menu</span>')) {
  c = c.replace(/\{\/\* Right actions \*\/\}/, '{/* Right actions */}\n        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: \'#00f0ff\', background: \'rgba(0,240,255,0.1)\' }}><span className="material-symbols-outlined">menu</span></button>');
}

// Fix aside
c = c.replace(/<aside className="fixed left-0 top-16 bottom-0 z-40 flex flex-col py-4"/, '<aside className={`fixed left-0 top-16 bottom-0 z-40 flex flex-col py-4 transition-transform duration-300 ${isMobileMenuOpen ? \'translate-x-0\' : \'-translate-x-full\'} md:translate-x-0`}');

// Fix main
c = c.replace(/<main className="flex flex-col overflow-hidden" style=\{\{ marginLeft: '256px', marginTop: '64px', flex: 1, minHeight: 0, minWidth: 0 \}\}/, '<main className="flex flex-col overflow-hidden md:ml-[256px]" style={{ marginTop: \'64px\', flex: 1, minHeight: 0, minWidth: 0 }}');

// Fix header repo name truncation
c = c.replace(/<span style=\{\{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '15px', color: '#dce4e5' \}\}>\s*\{repo\?.repoName || 'Loading\.\.\.'\}\s*<\/span>/, '<span className="truncate max-w-[120px] md:max-w-none" style={{ fontFamily: \'Geist, sans-serif\', fontWeight: 600, fontSize: \'15px\', color: \'#dce4e5\' }}>{repo?.repoName || \'Loading...\'}</span>');

fs.writeFileSync('src/pages/RepoAnalysis.tsx', c);
console.log('Fixed RepoAnalysis.tsx');
