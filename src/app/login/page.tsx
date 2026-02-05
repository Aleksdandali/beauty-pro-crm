'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m)
    setStep(1)
  }

  const handleSubmit = () => {
    if (mode === 'login') {
      setLoading(true)
      setTimeout(() => setLoading(false), 1500)
    } else if (step === 1) {
      setStep(2)
    } else {
      setLoading(true)
      setTimeout(() => setLoading(false), 1500)
    }
  }

  const goBack = () => setStep(1)

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg-0:#07060B;--bg-1:#0C0B12;--bg-2:#11101A;--bg-3:#161521;
          --bg-card:#13121E;--bg-card-h:#1A1928;
          --b1:rgba(255,255,255,0.04);--b2:rgba(255,255,255,0.07);
          --b3:rgba(255,255,255,0.12);--b4:rgba(255,255,255,0.18);
          --t1:#EEEDF2;--t2:#8D8BA0;--t3:#5C5A70;--t4:#3D3B50;
          --violet:#8B5CF6;--violet-s:rgba(139,92,246,0.10);
          --rose:#E8437A;--rose-s:rgba(232,67,122,0.10);
          --amber:#E5A430;--amber-s:rgba(229,164,48,0.10);
          --emerald:#22C583;--emerald-s:rgba(34,197,131,0.10);
          --g-main:linear-gradient(135deg,#8B5CF6,#E8437A,#E5A430);
          --g-text:linear-gradient(135deg,#C4B5FD,#F9A8D4,#FCD34D);
          --font:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;
          --ease:cubic-bezier(0.16,1,0.3,1);
          --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;
        }
        html{scroll-behavior:smooth}
        body{font-family:var(--font);background:var(--bg-0);color:var(--t1);overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.6;min-height:100vh}
        ::selection{background:var(--violet-s);color:var(--t1)}

        body::after{content:'';position:fixed;inset:0;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E");pointer-events:none;z-index:10000}

        .amb{position:fixed;pointer-events:none;border-radius:50%;filter:blur(140px);z-index:0}
        .amb-1{width:900px;height:900px;top:-350px;left:-250px;background:rgba(139,92,246,0.06)}
        .amb-2{width:700px;height:700px;top:35%;right:-300px;background:rgba(232,67,122,0.04)}

        .gt{background:var(--g-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

        .logo{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--t1)}
        .logo-mark{width:38px;height:38px;border-radius:10px;background:var(--g-main);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(139,92,246,0.2)}
        .logo-mark::after{content:'';position:absolute;inset:1.5px;border-radius:8.5px;background:var(--bg-0)}
        .logo-mark span{position:relative;z-index:1;font-weight:900;font-size:16px;background:var(--g-main);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .logo-text{display:flex;flex-direction:column;line-height:1}
        .logo-name{font-weight:800;font-size:18px;letter-spacing:-0.02em}
        .logo-name .pro{font-weight:800;background:var(--g-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .logo-sub{font-size:9px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--t3);margin-top:1px}

        .auth{display:flex;min-height:100vh;position:relative;z-index:1}

        .auth-left{flex:1 1 50%;display:flex;flex-direction:column;justify-content:center;padding:60px;position:relative;overflow:hidden}
        .auth-left::before{content:'';position:absolute;bottom:-80px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.06),transparent 70%);pointer-events:none}
        .auth-left-content{max-width:460px}
        .auth-left .logo{margin-bottom:52px}

        .auth-tagline{font-size:clamp(30px,3.2vw,40px);font-weight:800;letter-spacing:-0.035em;line-height:1.08;margin-bottom:14px}
        .auth-subtitle{color:var(--t2);font-size:15px;line-height:1.7;margin-bottom:48px}

        .auth-features{display:flex;flex-direction:column;gap:14px}
        .auth-feat{display:flex;align-items:center;gap:14px;padding:16px 18px;background:var(--bg-card);border:1px solid var(--b1);border-radius:var(--r-md);transition:all 0.3s var(--ease)}
        .auth-feat:hover{border-color:var(--b3);background:var(--bg-card-h);transform:translateX(4px)}
        .auth-feat-ico{width:40px;height:40px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .auth-feat-ico svg{width:18px;height:18px}
        .auth-feat-text{display:flex;flex-direction:column}
        .auth-feat-title{font-size:14px;font-weight:600;color:var(--t1)}
        .auth-feat-desc{font-size:12px;color:var(--t3);margin-top:1px}

        .auth-trust{margin-top:48px;display:flex;gap:24px;color:var(--t3);font-size:12px;font-weight:500}
        .auth-trust-item{display:flex;align-items:center;gap:6px}
        .auth-trust-item svg{width:14px;height:14px}

        .auth-right{flex:1 1 50%;display:flex;align-items:center;justify-content:center;padding:40px;position:relative}
        .auth-form-wrap{width:100%;max-width:400px}

        .auth-mobile-header{display:none;text-align:center;margin-bottom:32px}
        .auth-mobile-header .logo{justify-content:center}

        .auth-card{background:var(--bg-card);border:1px solid var(--b2);border-radius:var(--r-xl);padding:36px;position:relative;overflow:hidden}
        .auth-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g-main);opacity:0.4}

        .auth-tabs{display:flex;background:var(--bg-2);border-radius:var(--r-md);padding:3px;margin-bottom:28px}
        .auth-tab{flex:1;padding:10px 0;border:none;border-radius:10px;font-size:13px;font-weight:600;font-family:var(--font);cursor:pointer;transition:all 0.25s var(--ease);background:transparent;color:var(--t3)}
        .auth-tab.active{background:var(--bg-3);color:var(--t1);box-shadow:0 2px 8px rgba(0,0,0,0.3)}

        .auth-steps{display:flex;align-items:center;gap:8px;margin-bottom:24px}
        .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;transition:all 0.3s var(--ease)}
        .step-dot.active{background:var(--g-main);color:#fff}
        .step-dot.done{background:var(--g-main);color:#fff}
        .step-dot.inactive{background:var(--bg-2);color:var(--t3);border:1px solid var(--b2)}
        .step-line{flex:1;height:2px;border-radius:1px;transition:all 0.3s var(--ease)}
        .step-line.active{background:var(--g-main)}
        .step-line.inactive{background:var(--b1)}
        .step-label{font-size:11px;color:var(--t3);margin-left:6px;white-space:nowrap;font-weight:500}

        .field{margin-bottom:18px}
        .field-label{display:flex;align-items:center;gap:6px;color:var(--t2);font-size:13px;font-weight:600;margin-bottom:8px}
        .field-label svg{width:15px;height:15px;color:var(--t3);transition:color 0.2s}
        .field-wrap{position:relative}
        .field-input{width:100%;padding:13px 16px;background:var(--bg-2);border:1px solid var(--b2);border-radius:var(--r-md);color:var(--t1);font-size:14px;font-family:var(--font);font-weight:400;outline:none;transition:all 0.25s var(--ease)}
        .field-input::placeholder{color:var(--t4)}
        .field-input:focus{border-color:rgba(139,92,246,0.4);box-shadow:0 0 0 3px var(--violet-s)}
        .field-suffix{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:flex;align-items:center}
        .field-select{width:100%;padding:13px 16px;background:var(--bg-2);border:1px solid var(--b2);border-radius:var(--r-md);color:var(--t1);font-size:14px;font-family:var(--font);outline:none;-webkit-appearance:none;appearance:none;cursor:pointer;transition:border-color 0.25s}
        .field-select:focus{border-color:rgba(139,92,246,0.4);box-shadow:0 0 0 3px var(--violet-s)}
        .field-select option{background:var(--bg-2);color:var(--t1)}

        .eye-btn{background:none;border:none;color:var(--t3);cursor:pointer;padding:8px;display:flex;transition:color 0.2s}
        .eye-btn:hover{color:var(--t2)}

        .forgot-link{display:block;text-align:right;margin-top:-10px;margin-bottom:6px}
        .forgot-link a{color:var(--violet);font-size:13px;font-weight:500;text-decoration:none;transition:opacity 0.2s}
        .forgot-link a:hover{opacity:0.8}

        .auth-btn{width:100%;padding:14px 24px;border:none;border-radius:var(--r-md);font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;transition:all 0.35s var(--ease);display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:0.01em;position:relative;overflow:hidden}
        .auth-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(255,255,255,0.15),transparent);transform:translateX(-100%);transition:transform 0.6s}
        .auth-btn:hover::before{transform:translateX(100%)}
        .auth-btn-primary{background:var(--g-main);color:#fff;box-shadow:0 4px 24px rgba(139,92,246,0.2),0 1px 3px rgba(0,0,0,0.3)}
        .auth-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(139,92,246,0.3),0 2px 6px rgba(0,0,0,0.3)}
        .auth-btn-primary:disabled{opacity:0.6;cursor:wait;transform:none;box-shadow:none}
        .auth-btn-primary:disabled::before{display:none}
        .auth-btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--b2)}
        .auth-btn-ghost:hover{border-color:var(--b3);color:var(--t1);background:rgba(255,255,255,0.03);transform:translateY(-1px)}
        .auth-btn-ghost::before{display:none}
        .auth-btn svg{width:16px;height:16px}

        .auth-divider{display:flex;align-items:center;gap:14px;margin:24px 0}
        .auth-divider-line{flex:1;height:1px;background:var(--b1)}
        .auth-divider span{color:var(--t4);font-size:12px;font-weight:500}

        .auth-google{width:100%;padding:12px;background:var(--bg-2);border:1px solid var(--b2);border-radius:var(--r-md);color:var(--t2);font-size:13px;font-weight:500;font-family:var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all 0.2s}
        .auth-google:hover{border-color:var(--b3);color:var(--t1);background:rgba(255,255,255,0.03)}

        .trial-badge{margin-top:22px;padding:16px 18px;background:linear-gradient(135deg,rgba(139,92,246,0.04),rgba(232,67,122,0.02));border:1px solid rgba(139,92,246,0.1);border-radius:var(--r-md);display:flex;align-items:center;gap:14px}
        .trial-ico{width:42px;height:42px;border-radius:var(--r-sm);background:var(--violet-s);display:flex;align-items:center;justify-content:center;color:var(--violet);flex-shrink:0}
        .trial-ico svg{width:20px;height:20px}
        .trial-text h4{color:var(--t1);font-size:14px;font-weight:600;margin:0}
        .trial-text p{color:var(--t3);font-size:12px;margin:2px 0 0}

        .auth-footer{text-align:center;color:var(--t4);font-size:11px;margin-top:22px;line-height:1.7}
        .auth-footer a{color:var(--t3);text-decoration:underline;transition:color 0.2s}
        .auth-footer a:hover{color:var(--t2)}

        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{animation:spin 0.8s linear infinite}

        @media(max-width:960px){
          .auth-left{flex:1 1 45%;padding:40px}
        }
        @media(max-width:768px){
          .auth-left{display:none}
          .auth-mobile-header{display:block}
          .auth-right{padding:24px 20px}
          .auth-card{padding:28px 22px}
        }
      `}</style>

      <div className="amb amb-1"></div>
      <div className="amb amb-2"></div>

      <div className="auth">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-left-content">
            <Link href="/" className="logo">
              <div className="logo-mark"><span>S</span></div>
              <div className="logo-text">
                <span className="logo-name">Shine<span className="pro">PRO</span></span>
                <span className="logo-sub">CRM for beauty</span>
              </div>
            </Link>

            <h1 className="auth-tagline">Ваш салон заслуговує на <span className="gt">розумну CRM</span></h1>
            <p className="auth-subtitle">Автоматизація запису, аналітика клієнтів, Telegram-бот — все в одній системі. Створено для beauty-індустрії України.</p>

            <div className="auth-features">
              <div className="auth-feat">
                <div className="auth-feat-ico" style={{background:'var(--violet-s)',color:'var(--violet)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="auth-feat-text">
                  <span className="auth-feat-title">Онлайн-запис 24/7</span>
                  <span className="auth-feat-desc">Клієнти записуються через бот, без дзвінків</span>
                </div>
              </div>
              <div className="auth-feat">
                <div className="auth-feat-ico" style={{background:'var(--rose-s)',color:'var(--rose)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <div className="auth-feat-text">
                  <span className="auth-feat-title">RFM-аналітика клієнтів</span>
                  <span className="auth-feat-desc">Автоматична сегментація та реактивація</span>
                </div>
              </div>
              <div className="auth-feat">
                <div className="auth-feat-ico" style={{background:'var(--amber-s)',color:'var(--amber)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div className="auth-feat-text">
                  <span className="auth-feat-title">7 автоматизацій з коробки</span>
                  <span className="auth-feat-desc">Нагадування, follow-up, збір відгуків</span>
                </div>
              </div>
              <div className="auth-feat">
                <div className="auth-feat-ico" style={{background:'var(--emerald-s)',color:'var(--emerald)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="auth-feat-text">
                  <span className="auth-feat-title">Фінанси та склад</span>
                  <span className="auth-feat-desc">Зарплати, матеріали, прибуток — один клік</span>
                </div>
              </div>
            </div>

            <div className="auth-trust">
              <div className="auth-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                SSL шифрування
              </div>
              <div className="auth-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                14 днів FREE
              </div>
              <div className="auth-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Made in Ukraine
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-mobile-header">
              <Link href="/" className="logo">
                <div className="logo-mark"><span>S</span></div>
                <div className="logo-text">
                  <span className="logo-name">Shine<span className="pro">PRO</span></span>
                  <span className="logo-sub">CRM for beauty</span>
                </div>
              </Link>
            </div>

            <div className="auth-card">
              {/* Tabs */}
              <div className="auth-tabs">
                <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Вхід</button>
                <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Реєстрація</button>
              </div>

              {/* Steps (signup only) */}
              {mode === 'signup' && (
                <div className="auth-steps">
                  <div className={`step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : 'inactive'}`}>
                    {step > 1 ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : '1'}
                  </div>
                  <div className={`step-line ${step > 1 ? 'active' : 'inactive'}`}></div>
                  <div className={`step-dot ${step >= 2 ? 'active' : 'inactive'}`}>2</div>
                  <span className="step-label">{step === 1 ? 'Акаунт' : 'Салон'}</span>
                </div>
              )}

              {/* LOGIN */}
              {mode === 'login' && (
                <>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Email
                    </label>
                    <input className="field-input" type="email" placeholder="you@salon.com" />
                  </div>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Пароль
                    </label>
                    <div className="field-wrap">
                      <input className="field-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" style={{paddingRight:'44px'}} />
                      <div className="field-suffix">
                        <button className="eye-btn" type="button" onClick={() => setShowPassword(!showPassword)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="forgot-link"><a href="#">Забули пароль?</a></div>
                </>
              )}

              {/* SIGNUP STEP 1 */}
              {mode === 'signup' && step === 1 && (
                <>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Ваше ім&apos;я
                    </label>
                    <input className="field-input" type="text" placeholder="Олександр" />
                  </div>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Email
                    </label>
                    <input className="field-input" type="email" placeholder="you@salon.com" />
                  </div>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Пароль
                    </label>
                    <div className="field-wrap">
                      <input className="field-input" type={showSignupPassword ? 'text' : 'password'} placeholder="Мінімум 6 символів" style={{paddingRight:'44px'}} />
                      <div className="field-suffix">
                        <button className="eye-btn" type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SIGNUP STEP 2 */}
              {mode === 'signup' && step === 2 && (
                <>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      Назва салону
                    </label>
                    <input className="field-input" type="text" placeholder="Nail Studio OMG" />
                  </div>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Телефон
                    </label>
                    <input className="field-input" type="tel" placeholder="+380 67 123 45 67" />
                  </div>
                  <div className="field">
                    <label className="field-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Місто
                    </label>
                    <select className="field-select">
                      <option>Одеса</option><option>Київ</option><option>Харків</option>
                      <option>Дніпро</option><option>Львів</option><option>Запоріжжя</option>
                      <option>Вінниця</option><option>Миколаїв</option><option>Полтава</option>
                      <option>Черкаси</option><option>Інше</option>
                    </select>
                  </div>
                </>
              )}

              {/* ACTIONS */}
              <div style={{marginTop:'22px',display:'flex',flexDirection:'column',gap:'10px'}}>
                {mode === 'signup' && step === 2 && (
                  <button className="auth-btn auth-btn-ghost" onClick={goBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Назад
                  </button>
                )}
                <button className="auth-btn auth-btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      {mode === 'login' ? 'Зачекайте...' : 'Створюємо...'}
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Увійти' : step === 1 ? 'Далі' : 'Створити акаунт'}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </>
                  )}
                </button>
              </div>

              {/* Google */}
              {mode === 'login' && (
                <>
                  <div className="auth-divider">
                    <div className="auth-divider-line"></div>
                    <span>або</span>
                    <div className="auth-divider-line"></div>
                  </div>
                  <button className="auth-google">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Увійти через Google
                  </button>
                </>
              )}

              {/* Trial badge */}
              {mode === 'signup' && step === 2 && (
                <div className="trial-badge">
                  <div className="trial-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                  </div>
                  <div className="trial-text">
                    <h4>14 днів повний доступ</h4>
                    <p>Без картки · Без зобов&apos;язань · Скасуйте будь-коли</p>
                  </div>
                </div>
              )}
            </div>

            <div className="auth-footer">
              Продовжуючи, ви погоджуєтесь з{' '}
              <a href="#">умовами використання</a> та{' '}
              <a href="#">політикою конфіденційності</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
