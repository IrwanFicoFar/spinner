const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const dataFile = path.join(root, '.spinora-data.json');
const port = Number(process.env.PORT || 4173);
const sessions = new Map();
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml' };

const hash = (password, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, value:crypto.scryptSync(password, salt, 64).toString('hex') });
const verify = (password, account) => crypto.timingSafeEqual(Buffer.from(hash(password, account.salt).value, 'hex'), Buffer.from(account.passwordHash, 'hex'));
const demoHash = hash('spinora123', 'spinora-demo-salt');
const initialDb = () => ({
  accounts:{ 'admin@spinora.local':{ email:'admin@spinora.local', companyId:'demo', companyName:'Spinora Demo', salt:demoHash.salt, passwordHash:demoHash.value } },
  companies:{ demo:{ id:'demo', name:'Spinora Demo', revision:0, state:null } }
});
let db;
try { db = JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch { db = initialDb(); }
const persist = () => fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
const json = (res, status, value) => { const body = JSON.stringify(value); res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Content-Length':Buffer.byteLength(body), 'Cache-Control':'no-store' }); res.end(body); };
const body = req => new Promise((resolve, reject) => { let raw=''; req.on('data', chunk => { raw += chunk; if (raw.length > 2_000_000) reject(new Error('Payload terlalu besar')); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('JSON tidak valid')); } }); req.on('error', reject); });
const session = req => { const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, ''); const value = sessions.get(token); if (!value || value.expires < Date.now()) return null; value.expires = Date.now() + 1000 * 60 * 60 * 12; return value; };
const issueSession = account => { const token=crypto.randomBytes(32).toString('hex'); sessions.set(token,{ companyId:account.companyId, email:account.email, expires:Date.now()+1000*60*60*12 }); return token; };

async function api(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/login') {
    const input=await body(req), email=String(input.email||'').trim().toLowerCase(), account=db.accounts[email];
    if (!account || !verify(String(input.password||''), account)) return json(res,401,{ error:'Email atau kata sandi tidak cocok.' });
    return json(res,200,{ token:issueSession(account), company:{ id:account.companyId, name:account.companyName, email:account.email } });
  }
  if (req.method === 'POST' && url.pathname === '/api/register') {
    const input=await body(req), email=String(input.email||'').trim().toLowerCase(), companyName=String(input.companyName||'').trim(), password=String(input.password||'');
    if (!email || !companyName || password.length < 6) return json(res,400,{ error:'Lengkapi company, email, dan password minimal 6 karakter.' });
    if (db.accounts[email]) return json(res,409,{ error:'Email sudah terdaftar.' });
    const companyId=crypto.randomUUID(), secured=hash(password), account={ email, companyId, companyName, salt:secured.salt, passwordHash:secured.value };
    db.accounts[email]=account; db.companies[companyId]={ id:companyId, name:companyName, revision:1, state:input.state||null }; persist();
    return json(res,201,{ token:issueSession(account), company:{ id:companyId, name:companyName, email } });
  }
  const active=session(req); if (!active) return json(res,401,{ error:'Sesi tidak valid.' });
  const company=db.companies[active.companyId]; if (!company) return json(res,404,{ error:'Company tidak ditemukan.' });
  if (req.method === 'GET' && url.pathname === '/api/state') return json(res,200,{ company:{ id:company.id,name:company.name,email:active.email }, revision:company.revision, state:company.state });
  if (req.method === 'PUT' && url.pathname === '/api/state') {
    const input=await body(req); if (!input.state || typeof input.state !== 'object') return json(res,400,{ error:'State tidak valid.' });
    company.state=input.state; company.revision=(company.revision||0)+1; persist(); return json(res,200,{ revision:company.revision });
  }
  return json(res,404,{ error:'Endpoint tidak ditemukan.' });
}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req,res,url);
    if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    const requested=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
    const file=path.resolve(root,requested); if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory() || path.basename(file).startsWith('.')) { res.writeHead(404); return res.end('Not found'); }
    const content=fs.readFileSync(file); res.writeHead(200,{ 'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache' }); res.end(content);
  } catch(error) { json(res,500,{ error:error.message||'Terjadi kesalahan server.' }); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Spinora server: http://127.0.0.1:${port}`));
