# 🚀 Netlify XHTTP Relay

> Simple Netlify Edge Function relay project  
> Created by **amirs**

---

## 🇮🇷 Persian Guide

Persian version: [README_FA.md](./README_FA.md)

---

## ⚠️ Important Notice

Use this project only with your own domain/server or with permission.


---

## ✨ Features

- Netlify Edge Function relay
- Simple setup
- Works with Netlify website and Netlify CLI
- Environment variable based backend target
- Supports target domain with port

---

## 📦 Project Structure

```txt
.
├── netlify/
│   └── edge-functions/
│       └── relay.js
├── public/
│   └── index.html
├── netlify.toml
├── package.json
├── README.md
└── README_FA.md
```

---
## 🍴 Deploy by Forking This Repository

> This method works, but it is **not recommended** for most users.  
> Recommended method: download/copy the project and deploy your own version.

## 🔐 Required Environment Variable

You must set:

```txt
TARGET_DOMAIN=https://your-domain.com:443
```

### Important

The domain **must include port**.

Correct examples:

```txt
https://example.com:443
https://sub.example.com:443
https://api.example.com:8443
```

Wrong examples:

```txt
https://example.com
example.com:443
http://example.com:443
localhost:443
127.0.0.1:443
```

---

## 🚀 Deploy with Netlify Website

Use this project directly.

### 1. Import project

Go to Netlify:

```txt
https://app.netlify.com
```

Then:

```txt
Add new project → Import an existing project
```

Select your repository.

---

### 2. Build settings

Use:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `public` |

---

### 3. Add Environment Variable

Go to:

```txt
Site configuration → Environment variables → Add variable
```

Add:

```txt
Key: TARGET_DOMAIN
Value: https://your-domain.com:443
```

Example:

```txt
TARGET_DOMAIN=https://example.com:443
```

---

### 4. Redeploy

After adding `TARGET_DOMAIN`, redeploy:

```txt
Deploys → Trigger deploy → Deploy site
```

---

---

## 🍴 Deploy by Forking This Repository

> This method works, but it is **not recommended** for most users.  
> Recommended method: download/copy the project and deploy your own version.

### Why fork is not recommended?

- Your project stays connected to the original repository history
- Beginners may get confused with GitHub fork/update options
- If you want a clean personal project, copying the files is better

### If you still want to use Fork

1. Open this project on GitHub
2. Click **Fork**
3. Choose your GitHub account
4. After fork is created, go to Netlify
5. Click:

```txt
Add new project → Import an existing project → GitHub
```

6. Select your forked repository
7. Use these build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `public` |

8. Add environment variable:

```txt
TARGET_DOMAIN=https://your-domain.com:443
```

9. Deploy the site

After changing `TARGET_DOMAIN`, always redeploy.


## 💻 Deploy with Netlify CLI

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

---

### 2. Go to project folder

```bash
cd path/to/project
```

---

### 3. Login

```bash
netlify login
```

---

### 4. Link project

If your site already exists on Netlify:

```bash
netlify link
```

If you want CLI to create the site:

```bash
netlify init
```

---

### 5. Set TARGET_DOMAIN

The value must include port:

```bash
netlify env:set TARGET_DOMAIN "https://your-domain.com:443" --scope functions --context production
```

Example:

```bash
netlify env:set TARGET_DOMAIN "https://example.com:443" --scope functions --context production
```

---

### 6. Check env

```bash
netlify env:list
```

or:

```bash
netlify env:get TARGET_DOMAIN --context production
```

---

### 7. Deploy

```bash
netlify deploy --prod
```

---

## 🧪 Usage

| What you open | What it forwards to |
|---|---|
| `https://your-site.netlify.app/` | `https://your-domain.com:443/` |
| `https://your-site.netlify.app/path` | `https://your-domain.com:443/path` |
| `https://your-site.netlify.app/api/test` | `https://your-domain.com:443/api/test` |

---

## 🔗 Example Config

Replace placeholders with your own values.

```txt
vless://UUID@YOUR_NETLIFY_DOMAIN:443?encryption=none&security=tls&sni=YOUR_NETLIFY_DOMAIN&fp=chrome&alpn=h2%2Chttp%2F1.1&insecure=0&allowInsecure=0&type=xhttp&host=YOUR_NETLIFY_DOMAIN&path=YOUR_PATH&mode=auto&extra=%7B%22xPaddingBytes%22%3A%22100-1000%22%7D#net
```

### Replace these

| Placeholder | Meaning |
|---|---|
| `UUID` | Your UUID |
| `YOUR_NETLIFY_DOMAIN` | Your Netlify domain, for example `your-site.netlify.app` |
| `YOUR_PATH` | Your backend path |


Use this sni - adress for your config:

```txt
kubernetes.io
helm.sh
letsencrypt.org
```

---

## 🐞 Debug

### Check deploy logs

```txt
Site → Deploys → Latest deploy → View logs
```

### Check Edge Function logs

```txt
Site → Edge Functions → relay → Logs
```

### Check env

```bash
netlify env:list
netlify env:get TARGET_DOMAIN --context production
```

### Test your backend

```bash
curl -I "https://your-domain.com:443"
```

If this command fails, fix your backend/domain/port first.

---

## ❌ Common Errors

| Error | Reason | Fix |
|---|---|---|
| `dns error` | Domain cannot be resolved | Check domain DNS |
| `connection refused` | Port is closed | Open the port or use correct port |
| `SSL/TLS error` | Certificate/SNI problem | Use correct domain and valid SSL |
| Still using old domain | Old deploy/env | Set env again and redeploy |
| `404` | Route problem | Check `netlify.toml` |

---

## ✅ Quick Checklist

- [ ] `TARGET_DOMAIN` is set
- [ ] `TARGET_DOMAIN` includes `https://`
- [ ] `TARGET_DOMAIN` includes port
- [ ] Backend domain resolves publicly
- [ ] Backend port is open
- [ ] You redeployed after changing env

---

## 💰 Donate

Solana:

```txt
E7S8EBUE5tkY5UaTgDvhaanJMeCi2DxPGYZukJGrJV8J
```

---

## 📢 Telegram Channel

```txt
https://t.me/avaco_cloud
```

---

## 💬 Contact

```txt
@ShakerFPS
```

---

## 👤 Author

**amirs**

---

## 📜 License

MIT License © amirs
