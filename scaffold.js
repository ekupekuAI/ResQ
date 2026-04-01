import fs from 'fs';
import path from 'path';

const pages = [
  'LandingPage', 'AuthPage', 'CreateSociety', 'JoinSociety', 'Home',
  'SendAlert', 'SafetyCheck', 'Announcements', 'AdminDashboard', 'GuardView', 'Profile'
];

fs.mkdirSync('src/pages', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });

pages.forEach(page => {
  fs.writeFileSync(`src/pages/${page}.jsx`, `export default function ${page}() { return <div className="p-4">${page}</div>; }\n`);
});

fs.writeFileSync('src/components/Navbar.jsx', `export default function Navbar() { return <div className="fixed bottom-0 w-full p-4 bg-white dark:bg-black border-t">Navbar</div>; }\n`);
console.log('Scaffolding complete.');
