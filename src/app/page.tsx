'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)
  const [masters, setMasters] = useState(4)
  const [bookings, setBookings] = useState(6)
  const [avgCheck, setAvgCheck] = useState(850)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  // Scroll handler for nav
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculator
  const workDays = 26
  const monthlyRevenue = masters * bookings * avgCheck * workDays
  const lossNoshow = Math.round(monthlyRevenue * 0.12)
  const lossChurn = Math.round(monthlyRevenue * 0.34 * 0.15)
  const lossMaterials = masters * 4500
  const lossTime = masters * 150 * workDays
  const lossTotal = lossNoshow + lossChurn + lossMaterials + lossTime

  const formatNumber = (n: number) => n.toLocaleString('uk-UA')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 4000)
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg-0:#07060B;--bg-1:#0C0B12;--bg-2:#11101A;--bg-3:#161521;
          --bg-card:#13121E;--bg-card-h:#1A1928;
          --b1:rgba(255,255,255,0.04);--b2:rgba(255,255,255,0.07);
          --b3:rgba(255,255,255,0.12);--b4:rgba(255,255,255,0.18);
          --t1:#EEEDF2;--t2:#8D8BA0;--t3:#5C5A70;--t4:#3D3B50;
          --violet:#8B5CF6;--violet-s:rgba(139,92,246,0.10);--violet-g:rgba(139,92,246,0.25);
          --rose:#E8437A;--rose-s:rgba(232,67,122,0.10);
          --amber:#E5A430;--amber-s:rgba(229,164,48,0.10);
          --emerald:#22C583;--emerald-s:rgba(34,197,131,0.10);
          --sky:#38ADF5;--sky-s:rgba(56,173,245,0.10);
          --g-main:linear-gradient(135deg,#8B5CF6,#E8437A,#E5A430);
          --g-text:linear-gradient(135deg,#C4B5FD,#F9A8D4,#FCD34D);
          --g-subtle:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(232,67,122,0.06),rgba(229,164,48,0.03));
          --font:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;
          --ease:cubic-bezier(0.16,1,0.3,1);
          --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;
        }
        html{scroll-behavior:smooth}
        body{font-family:var(--font);background:var(--bg-0);color:var(--t1);overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.6}
        ::selection{background:var(--violet-s);color:var(--t1)}
        
        body::after{content:'';position:fixed;inset:0;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E");pointer-events:none;z-index:10000}

        .amb{position:fixed;pointer-events:none;border-radius:50%;filter:blur(140px);z-index:0}
        .amb-1{width:900px;height:900px;top:-350px;left:-250px;background:rgba(139,92,246,0.06)}
        .amb-2{width:700px;height:700px;top:35%;right:-300px;background:rgba(232,67,122,0.04)}
        .amb-3{width:800px;height:800px;bottom:5%;left:-200px;background:rgba(229,164,48,0.03)}

        .ico{width:48px;height:48px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0}
        .ico svg{width:22px;height:22px}
        .ico-violet{background:var(--violet-s);color:var(--violet)}
        .ico-rose{background:var(--rose-s);color:var(--rose)}
        .ico-amber{background:var(--amber-s);color:var(--amber)}
        .ico-emerald{background:var(--emerald-s);color:var(--emerald)}
        .ico-sky{background:var(--sky-s);color:var(--sky)}

        .nav{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all 0.4s}
        .nav.scrolled{background:rgba(7,6,11,0.82);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);border-bottom:1px solid var(--b1)}
        .nav-in{max-width:1240px;margin:0 auto;padding:0 32px;height:68px;display:flex;align-items:center;justify-content:space-between}
        .nav-l{display:flex;align-items:center;gap:48px}
        .logo{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--t1)}
        .logo-mark{width:34px;height:34px;border-radius:9px;background:var(--g-main);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .logo-mark::after{content:'';position:absolute;inset:1.5px;border-radius:7.5px;background:var(--bg-0)}
        .logo-mark span{position:relative;z-index:1;font-weight:800;font-size:14px;background:var(--g-main);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .logo-name{font-weight:700;font-size:17px;letter-spacing:-0.02em}
        .nav-menu{display:flex;gap:2px;list-style:none}
        .nav-menu a{color:var(--t2);text-decoration:none;font-size:14px;font-weight:500;padding:8px 14px;border-radius:var(--r-sm);transition:all 0.2s}
        .nav-menu a:hover{color:var(--t1);background:rgba(255,255,255,0.04)}
        .nav-r{display:flex;align-items:center;gap:12px}
        .btn-s{padding:9px 22px;font-size:13px;font-weight:600;color:var(--bg-0);background:var(--t1);border:none;border-radius:var(--r-sm);cursor:pointer;font-family:var(--font);transition:all 0.3s var(--ease);text-decoration:none}
        .btn-s:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(255,255,255,0.15)}

        .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:160px 32px 100px;overflow:hidden}
        .hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(ellipse 70% 55% at 50% 40%,black,transparent);-webkit-mask-image:radial-gradient(ellipse 70% 55% at 50% 40%,black,transparent)}
        .hero-radial{position:absolute;width:1100px;height:650px;top:50%;left:50%;transform:translate(-50%,-55%);background:radial-gradient(ellipse,rgba(139,92,246,0.07) 0%,rgba(232,67,122,0.025) 40%,transparent 70%);pointer-events:none}

        .hero-c{position:relative;z-index:1;max-width:840px}
        .hero-pill{display:inline-flex;align-items:center;gap:10px;padding:7px 18px 7px 10px;border-radius:100px;border:1px solid rgba(139,92,246,0.18);background:rgba(139,92,246,0.05);font-size:13px;font-weight:500;color:var(--violet);margin-bottom:36px;transition:border-color 0.3s,background 0.3s;cursor:default}
        .hero-pill:hover{border-color:rgba(139,92,246,0.3);background:rgba(139,92,246,0.08)}
        .pill-dot{width:7px;height:7px;border-radius:50%;background:var(--violet);position:relative}
        .pill-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:var(--violet);opacity:0.3;animation:ping 2s infinite}
        @keyframes ping{0%{transform:scale(1);opacity:0.3}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}

        .hero h1{font-size:clamp(42px,6.5vw,80px);font-weight:800;line-height:1.02;letter-spacing:-0.04em}
        .gt{background:var(--g-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero-desc{font-size:clamp(16px,1.8vw,20px);color:var(--t2);max-width:540px;margin:24px auto 0;font-weight:400;line-height:1.65}
        .hero-btns{display:flex;gap:14px;justify-content:center;margin-top:44px}

        .btn-p{display:inline-flex;align-items:center;gap:10px;padding:15px 34px;font-size:15px;font-weight:600;color:var(--bg-0);background:var(--t1);border:none;border-radius:var(--r-md);cursor:pointer;font-family:var(--font);transition:all 0.35s var(--ease);text-decoration:none;position:relative;overflow:hidden}
        .btn-p::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(255,255,255,0.15),transparent);transform:translateX(-100%);transition:transform 0.6s}
        .btn-p:hover::before{transform:translateX(100%)}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(255,255,255,0.12)}

        .btn-g{display:inline-flex;align-items:center;gap:10px;padding:15px 32px;font-size:15px;font-weight:500;color:var(--t2);background:rgba(255,255,255,0.03);border:1px solid var(--b2);border-radius:var(--r-md);cursor:pointer;font-family:var(--font);text-decoration:none;transition:all 0.35s var(--ease)}
        .btn-g:hover{color:var(--t1);background:rgba(255,255,255,0.06);border-color:var(--b3);transform:translateY(-2px)}

        .hero-proof{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:48px}
        .avatars{display:flex}
        .av{width:34px;height:34px;border-radius:50%;border:2px solid var(--bg-0);margin-left:-10px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--bg-0)}
        .av:first-child{margin-left:0}
        .hero-proof span{font-size:14px;color:var(--t2)}
        .hero-proof strong{color:var(--t1);font-weight:600}

        .eyebrow{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;display:block;margin-bottom:16px;background:var(--g-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent}

        .calc{padding:140px 32px;position:relative}
        .calc-wrap{max-width:1000px;margin:0 auto}
        .calc-hd{text-align:center;max-width:680px;margin:0 auto 60px}
        .calc-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px}
        .calc-hd p{color:var(--t2);font-size:16px;line-height:1.65}
        .calc-box{border-radius:var(--r-xl);border:1px solid var(--b2);background:var(--bg-card);padding:48px;position:relative;overflow:hidden}
        .calc-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:var(--g-main);opacity:0.3}
        .calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
        .calc-inputs{display:flex;flex-direction:column;gap:28px}
        .calc-field label{display:block;font-size:13px;font-weight:600;color:var(--t2);margin-bottom:10px}
        .range-current{font-size:24px;font-weight:800;color:var(--t1);margin-bottom:12px;font-variant-numeric:tabular-nums}
        .calc-field input[type="range"]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.06);outline:none;cursor:pointer}
        .calc-field input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--violet);border:3px solid var(--bg-card);cursor:pointer;box-shadow:0 0 20px rgba(139,92,246,0.4);transition:transform 0.2s}
        .calc-field input[type="range"]::-webkit-slider-thumb:hover{transform:scale(1.15)}
        .range-vals{display:flex;justify-content:space-between;margin-top:8px}
        .range-vals span{font-size:11px;color:var(--t4)}

        .calc-results{padding:32px;border-radius:var(--r-lg);background:rgba(139,92,246,0.04);border:1px solid rgba(139,92,246,0.12)}
        .calc-results h3{font-size:16px;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:10px}
        .loss-item{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--b1)}
        .loss-item:last-of-type{border-bottom:none}
        .loss-label{font-size:14px;color:var(--t2)}
        .loss-value{font-size:18px;font-weight:800;color:var(--rose);font-variant-numeric:tabular-nums}
        .loss-total{margin-top:20px;padding:20px;border-radius:var(--r-md);background:rgba(232,67,122,0.08);border:1px solid rgba(232,67,122,0.15);text-align:center}
        .loss-total-label{font-size:13px;color:var(--t2);margin-bottom:6px}
        .loss-total-value{font-size:36px;font-weight:900;color:var(--rose);font-variant-numeric:tabular-nums;letter-spacing:-0.03em}
        .loss-total-sub{font-size:12px;color:var(--t3);margin-top:4px}
        .calc-cta{margin-top:20px;text-align:center}
        .calc-cta .btn-p{width:100%;justify-content:center}

        .showcase{position:relative;padding:0 32px 140px;z-index:1}
        .show-wrap{max-width:1140px;margin:0 auto;position:relative}
        .show-border{position:absolute;inset:-1px;border-radius:18px;background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(232,67,122,0.15),rgba(229,164,48,0.08));z-index:0}
        .show-border-in{position:absolute;inset:1px;border-radius:17px;background:var(--bg-1)}
        .show-frame{position:relative;z-index:1;border-radius:18px;overflow:hidden;background:var(--bg-1);box-shadow:0 24px 80px rgba(0,0,0,0.5),0 0 0 1px var(--b1),0 0 60px rgba(139,92,246,0.1)}
        .chrome{display:flex;align-items:center;padding:14px 20px;background:rgba(255,255,255,0.012);border-bottom:1px solid var(--b1);gap:10px}
        .dots{display:flex;gap:7px}
        .dot{width:12px;height:12px;border-radius:50%}
        .dot-r{background:rgba(255,95,87,0.65)}.dot-y{background:rgba(255,189,46,0.55)}.dot-g{background:rgba(39,201,63,0.55)}
        .url-bar{flex:1;max-width:360px;margin-left:12px;padding:6px 14px;border-radius:6px;background:rgba(255,255,255,0.025);border:1px solid var(--b1);font-size:12px;color:var(--t3);display:flex;align-items:center;gap:6px}

        .dash{display:grid;grid-template-columns:240px 1fr;min-height:520px}
        .d-side{border-right:1px solid var(--b1);padding:20px 0;background:rgba(255,255,255,0.006)}
        .d-salon{margin:0 14px 20px;padding:14px;border-radius:var(--r-md);background:var(--g-subtle);border:1px solid var(--b1)}
        .d-salon-n{font-size:13px;font-weight:700;margin-bottom:2px}
        .d-salon-p{font-size:11px;color:var(--t3)}
        .d-salon-bar{height:4px;background:rgba(255,255,255,0.05);border-radius:2px;margin-top:10px;overflow:hidden}
        .d-salon-fill{height:100%;width:73%;border-radius:2px;background:var(--g-main)}
        .d-grp{padding:0 14px;margin-bottom:24px}
        .d-grp-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--t4);padding:0 12px;margin-bottom:6px}
        .d-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-sm);font-size:13px;font-weight:500;color:var(--t3);cursor:default;transition:all 0.15s;margin-bottom:1px}
        .d-item:hover{color:var(--t2);background:rgba(255,255,255,0.02)}
        .d-item.act{color:var(--t1);background:var(--violet-s)}
        .d-item svg{width:18px;height:18px;opacity:0.5;flex-shrink:0}
        .d-item.act svg{opacity:0.85}
        .d-badge{margin-left:auto;font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:var(--violet-s);color:var(--violet)}

        .d-main{padding:24px 28px;overflow:hidden}
        .d-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
        .d-title{font-size:20px;font-weight:700;letter-spacing:-0.02em}
        .d-actions{display:flex;gap:8px}
        .d-filter{padding:7px 14px;font-size:12px;font-weight:500;color:var(--t3);background:rgba(255,255,255,0.025);border:1px solid var(--b1);border-radius:var(--r-sm);font-family:var(--font);display:flex;align-items:center;gap:6px}
        .d-add{padding:7px 14px;font-size:12px;font-weight:600;color:white;background:var(--violet);border:none;border-radius:var(--r-sm);font-family:var(--font);display:flex;align-items:center;gap:5px}

        .d-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .d-stat{padding:18px;border-radius:var(--r-md);border:1px solid var(--b1);background:rgba(255,255,255,0.012);transition:all 0.3s var(--ease)}
        .d-stat:hover{border-color:var(--b3);background:rgba(255,255,255,0.025)}
        .d-stat-l{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px}
        .d-stat-v{font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1;margin-bottom:6px}
        .d-delta{font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:100px}
        .d-delta.up{color:var(--emerald);background:var(--emerald-s)}

        .d-bottom{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .d-card{border-radius:var(--r-md);border:1px solid var(--b1);background:rgba(255,255,255,0.012);overflow:hidden}
        .d-card-hd{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--b1)}
        .d-card-t{font-size:13px;font-weight:700}
        .d-card-sub{font-size:11px;color:var(--t3)}

        .d-row{display:grid;grid-template-columns:36px 1fr auto auto;gap:12px;align-items:center;padding:10px 18px;border-bottom:1px solid var(--b1);transition:background 0.15s}
        .d-row:last-child{border-bottom:none}
        .d-row:hover{background:rgba(255,255,255,0.012)}
        .d-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--bg-0)}
        .d-name{font-size:13px;font-weight:600}
        .d-svc{font-size:11px;color:var(--t3)}
        .d-time{font-size:12px;color:var(--t2);font-weight:500;font-variant-numeric:tabular-nums}
        .d-status{font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px}
        .st-ok{color:var(--emerald);background:var(--emerald-s)}
        .st-wait{color:var(--amber);background:var(--amber-s)}
        .st-done{color:var(--sky);background:var(--sky-s)}

        .feat{padding:140px 32px;position:relative}
        .feat-hd{text-align:center;max-width:680px;margin:0 auto 64px}
        .feat-hd h2{font-size:clamp(32px,4.5vw,50px);font-weight:800;letter-spacing:-0.035em;line-height:1.1;margin-bottom:16px}
        .feat-hd p{color:var(--t2);font-size:17px;line-height:1.65}

        .bento{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:minmax(200px,auto);gap:14px;max-width:1140px;margin:0 auto}
        .bc{border-radius:var(--r-lg);border:1px solid var(--b2);background:var(--bg-card);padding:32px;position:relative;overflow:hidden;transition:all 0.5s var(--ease)}
        .bc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:var(--g-main);opacity:0;transition:opacity 0.5s}
        .bc:hover{border-color:var(--b3);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.3)}
        .bc:hover::before{opacity:0.4}
        .bc-1{grid-column:span 7;grid-row:span 2}.bc-2{grid-column:span 5}.bc-3{grid-column:span 5}
        .bc-4{grid-column:span 4}.bc-5{grid-column:span 4}.bc-6{grid-column:span 4}
        .bc h3{font-size:18px;font-weight:700;letter-spacing:-0.02em;margin-top:20px;margin-bottom:8px}
        .bc>p{color:var(--t2);font-size:14px;line-height:1.65}

        .pricing{padding:140px 32px;position:relative}
        .pricing-hd{text-align:center;max-width:680px;margin:0 auto 60px}
        .pricing-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px}
        .pricing-hd p{color:var(--t2);font-size:16px}

        .pricing-toggle{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:48px}
        .pricing-toggle span{font-size:14px;color:var(--t3);font-weight:500;transition:color 0.3s}
        .pricing-toggle span.active{color:var(--t1)}
        .toggle-wrap{width:52px;height:28px;border-radius:14px;background:var(--violet);cursor:pointer;position:relative;transition:background 0.3s}
        .toggle-knob{width:22px;height:22px;border-radius:50%;background:white;position:absolute;top:3px;left:3px;transition:transform 0.3s var(--ease);box-shadow:0 2px 8px rgba(0,0,0,0.2)}
        .toggle-wrap.annual .toggle-knob{transform:translateX(24px)}
        .save-badge{padding:4px 10px;border-radius:100px;background:var(--emerald-s);color:var(--emerald);font-size:11px;font-weight:700}

        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1000px;margin:0 auto}
        .price-card{padding:36px 28px;border-radius:var(--r-xl);border:1px solid var(--b2);background:var(--bg-card);position:relative;transition:all 0.4s var(--ease);display:flex;flex-direction:column}
        .price-card:hover{transform:translateY(-4px);border-color:var(--b3);box-shadow:0 12px 40px rgba(0,0,0,0.3)}
        .price-card.popular{border-color:rgba(139,92,246,0.3);background:linear-gradient(180deg,rgba(139,92,246,0.04) 0%,var(--bg-card) 100%)}
        .price-card.popular::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g-main);border-radius:var(--r-xl) var(--r-xl) 0 0}
        .popular-tag{position:absolute;top:-12px;left:50%;transform:translateX(-50%);padding:4px 16px;border-radius:100px;background:var(--violet);color:white;font-size:11px;font-weight:700;white-space:nowrap}
        .price-name{font-size:16px;font-weight:700;margin-bottom:4px}
        .price-desc{font-size:13px;color:var(--t3);margin-bottom:20px;line-height:1.5}
        .price-amount{margin-bottom:24px}
        .price-num{font-size:42px;font-weight:900;letter-spacing:-0.04em;font-variant-numeric:tabular-nums}
        .price-period{font-size:14px;color:var(--t3);font-weight:400}
        .price-features{display:flex;flex-direction:column;gap:12px;margin-bottom:32px;flex:1}
        .pf{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--t2);line-height:1.5}
        .pf svg{width:16px;height:16px;color:var(--emerald);flex-shrink:0;margin-top:2px}
        .price-btn{width:100%;padding:14px;border-radius:var(--r-md);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all 0.3s var(--ease);text-align:center;border:none;text-decoration:none;display:block}
        .price-btn-primary{background:var(--t1);color:var(--bg-0)}
        .price-btn-primary:hover{box-shadow:0 4px 20px rgba(255,255,255,0.15);transform:translateY(-1px)}
        .price-btn-outline{background:transparent;color:var(--t2);border:1px solid var(--b2)}
        .price-btn-outline:hover{border-color:var(--b3);color:var(--t1);background:rgba(255,255,255,0.03)}

        .test{padding:140px 32px}
        .test-hd{text-align:center;max-width:600px;margin:0 auto 64px}
        .test-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;margin-bottom:12px}
        .test-hd p{color:var(--t2);font-size:16px}
        .test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1140px;margin:0 auto}
        .tc-card{padding:28px;border-radius:var(--r-lg);border:1px solid var(--b2);background:var(--bg-card);transition:all 0.4s var(--ease);display:flex;flex-direction:column}
        .tc-card:hover{border-color:var(--b3);transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.25)}
        .tc-stars{display:flex;gap:3px;margin-bottom:16px}
        .tc-star{width:16px;height:16px;color:var(--amber)}
        .tc-text{font-size:14px;line-height:1.7;color:var(--t2);flex:1;margin-bottom:20px}
        .tc-text strong{color:var(--t1);font-weight:600}
        .tc-author{display:flex;align-items:center;gap:12px;border-top:1px solid var(--b1);padding-top:16px}
        .tc-av-c{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--bg-0)}
        .tc-name{font-size:14px;font-weight:700}
        .tc-co{font-size:12px;color:var(--t3);margin-top:1px}

        .faq{padding:140px 32px}
        .faq-hd{text-align:center;max-width:680px;margin:0 auto 60px}
        .faq-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px}
        .faq-hd p{color:var(--t2);font-size:16px}
        .faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:8px}
        .faq-item{border-radius:var(--r-md);border:1px solid var(--b2);background:var(--bg-card);overflow:hidden;transition:border-color 0.3s}
        .faq-item.open{border-color:var(--b3)}
        .faq-q{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;cursor:pointer;gap:16px;transition:background 0.2s}
        .faq-q:hover{background:rgba(255,255,255,0.012)}
        .faq-q span{font-size:15px;font-weight:600}
        .faq-q svg{width:18px;height:18px;color:var(--t3);transition:transform 0.3s var(--ease);flex-shrink:0}
        .faq-item.open .faq-q svg{transform:rotate(45deg);color:var(--violet)}
        .faq-a{max-height:0;overflow:hidden;transition:max-height 0.4s var(--ease)}
        .faq-a-in{padding:0 24px 20px;font-size:14px;color:var(--t2);line-height:1.7}

        .cta{padding:140px 32px;text-align:center;position:relative}
        .cta-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:500px;background:radial-gradient(ellipse,rgba(139,92,246,0.07) 0%,rgba(232,67,122,0.025) 40%,transparent 70%);pointer-events:none}
        .cta-c{position:relative;z-index:1;max-width:640px;margin:0 auto}
        .cta-c h2{font-size:clamp(32px,4.5vw,52px);font-weight:800;letter-spacing:-0.035em;line-height:1.1;margin-bottom:16px}
        .cta-desc{color:var(--t2);font-size:18px;margin-bottom:40px;line-height:1.6}

        .lead-form{max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
        .lead-row{display:flex;gap:12px}
        .lead-row input,.lead-form input[type="tel"]{flex:1;padding:14px 18px;border-radius:var(--r-md);border:1px solid var(--b2);background:rgba(255,255,255,0.03);color:var(--t1);font-family:var(--font);font-size:14px;outline:none;transition:border-color 0.3s}
        .lead-row input:focus,.lead-form input[type="tel"]:focus{border-color:var(--violet)}
        .lead-row input::placeholder,.lead-form input::placeholder{color:var(--t4)}
        .lead-submit{padding:16px 40px;font-size:16px;font-weight:700;color:var(--bg-0);background:var(--t1);border:none;border-radius:var(--r-md);cursor:pointer;font-family:var(--font);transition:all 0.35s var(--ease);position:relative;overflow:hidden}
        .lead-submit:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(255,255,255,0.12)}
        .lead-note{font-size:12px;color:var(--t4);margin-top:4px}

        .cta-feats{display:flex;justify-content:center;gap:24px;margin-top:28px;flex-wrap:wrap}
        .cta-f{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--t2)}
        .cta-f svg{width:16px;height:16px;color:var(--emerald)}

        .toast{position:fixed;bottom:40px;left:50%;transform:translateX(-50%) translateY(100px);padding:16px 28px;border-radius:var(--r-md);background:var(--emerald);color:var(--bg-0);font-weight:600;font-size:14px;z-index:9999;transition:transform 0.5s var(--ease);display:flex;align-items:center;gap:10px}
        .toast.show{transform:translateX(-50%) translateY(0)}
        .toast svg{width:20px;height:20px}

        .foot{border-top:1px solid var(--b1);padding:40px 32px}
        .foot-in{max-width:1240px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
        .foot-l{display:flex;align-items:center;gap:32px}
        .foot-copy{font-size:13px;color:var(--t3)}
        .foot-links{display:flex;gap:24px}
        .foot-links a{font-size:13px;color:var(--t3);text-decoration:none;transition:color 0.2s}
        .foot-links a:hover{color:var(--t2)}

        @media(max-width:1024px){
          .bento{grid-template-columns:repeat(6,1fr)}
          .bc-1{grid-column:span 6;grid-row:span 1}.bc-2,.bc-3{grid-column:span 3}.bc-4,.bc-5,.bc-6{grid-column:span 2}
          .dash{grid-template-columns:1fr}.d-side{display:none}
          .pricing-grid{grid-template-columns:1fr;max-width:400px;margin:0 auto}
          .calc-grid{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .bento{grid-template-columns:1fr}
          .bc-1,.bc-2,.bc-3,.bc-4,.bc-5,.bc-6{grid-column:span 1}
          .d-stats{grid-template-columns:repeat(2,1fr)}
          .d-bottom{grid-template-columns:1fr}
          .test-grid{grid-template-columns:1fr;max-width:500px}
          .nav-menu{display:none}.nav-l{gap:0}
          .hero-btns{flex-direction:column;align-items:center}
          .hero-proof{flex-direction:column;gap:12px}
          .foot-in{flex-direction:column;gap:20px;text-align:center}
          .foot-l{flex-direction:column;gap:16px}
          .lead-row{flex-direction:column}
          .cta-feats{gap:16px}
        }
      `}</style>

      <div className="amb amb-1"></div>
      <div className="amb amb-2"></div>
      <div className="amb amb-3"></div>

      {/* NAV */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-in">
          <div className="nav-l">
            <Link href="/" className="logo">
              <div className="logo-mark"><span>S</span></div>
              <span className="logo-name">ShinePRO</span>
            </Link>
            <ul className="nav-menu">
              <li><a href="#product">Продукт</a></li>
              <li><a href="#features">Можливості</a></li>
              <li><a href="#pricing">Тарифи</a></li>
              <li><a href="#reviews">Відгуки</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div className="nav-r">
            <a href="#cta" className="btn-s">Спробувати</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-radial"></div>
        <div className="hero-c">
          <div className="hero-pill"><span className="pill-dot"></span>CRM створена для beauty-індустрії</div>
          <h1>Ваш салон втрачає <span className="gt">₴47 000</span> щомісяця без CRM</h1>
          <p className="hero-desc">No-show, забуті клієнти, хаос у записах — це не дрібниці, це реальні гроші. ShinePRO закриває ці діри за 5 хвилин.</p>
          <div className="hero-btns">
            <a href="#cta" className="btn-p">
              Запустити безкоштовно
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#calculator" className="btn-g">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Розрахувати втрати
            </a>
          </div>
          <div className="hero-proof">
            <div className="avatars">
              <div className="av" style={{background:'var(--violet)'}}>ОМ</div>
              <div className="av" style={{background:'var(--rose)'}}>ІК</div>
              <div className="av" style={{background:'var(--amber)'}}>АШ</div>
              <div className="av" style={{background:'var(--emerald)'}}>НП</div>
              <div className="av" style={{background:'var(--sky)'}}>ТВ</div>
            </div>
            <span>Створено для <strong>українських салонів краси</strong></span>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="showcase" id="product">
        <div className="show-wrap">
          <div className="show-border"><div className="show-border-in"></div></div>
          <div className="show-frame">
            <div className="chrome">
              <div className="dots"><span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span></div>
              <div className="url-bar">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--emerald)'}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                app.shineprocrm.com/dashboard
              </div>
            </div>
            <div className="dash">
              <div className="d-side">
                <div className="d-salon">
                  <div className="d-salon-n">Nail Studio OMG</div>
                  <div className="d-salon-p">Pro план · 4 майстри</div>
                  <div className="d-salon-bar"><div className="d-salon-fill"></div></div>
                </div>
                <div className="d-grp">
                  <div className="d-grp-label">Основне</div>
                  <div className="d-item act">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                    Дашборд
                  </div>
                  <div className="d-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Календар<span className="d-badge">12</span>
                  </div>
                  <div className="d-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    Клієнти
                  </div>
                </div>
              </div>
              <div className="d-main">
                <div className="d-top">
                  <div className="d-title">Дашборд</div>
                  <div className="d-actions">
                    <div className="d-filter">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                      Лютий 2026
                    </div>
                    <div className="d-add">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Новий запис
                    </div>
                  </div>
                </div>
                <div className="d-stats">
                  <div className="d-stat"><div className="d-stat-l">Виручка</div><div className="d-stat-v">₴284K</div><span className="d-delta up">↑ 12.3%</span></div>
                  <div className="d-stat"><div className="d-stat-l">Записи</div><div className="d-stat-v">847</div><span className="d-delta up">↑ 8.1%</span></div>
                  <div className="d-stat"><div className="d-stat-l">Нові клієнти</div><div className="d-stat-v">126</div><span className="d-delta up">↑ 15.7%</span></div>
                  <div className="d-stat"><div className="d-stat-l">Ретеншен</div><div className="d-stat-v">94%</div><span className="d-delta up">↑ 2.1%</span></div>
                </div>
                <div className="d-bottom">
                  <div className="d-card">
                    <div className="d-card-hd"><div><div className="d-card-t">Виручка по дням</div><div className="d-card-sub">Лютий 2026</div></div><div className="d-card-sub">₴284,200</div></div>
                    <div style={{padding:'16px',height:'140px'}}>
                      <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
                        <defs>
                          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d="M0,80 L40,65 L80,70 L120,45 L160,55 L200,30 L240,40 L280,25 L320,35 L360,15 L400,20" fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M0,80 L40,65 L80,70 L120,45 L160,55 L200,30 L240,40 L280,25 L320,35 L360,15 L400,20 L400,100 L0,100 Z" fill="url(#cg)"/>
                      </svg>
                    </div>
                  </div>
                  <div className="d-card">
                    <div className="d-card-hd"><div><div className="d-card-t">Найближчі записи</div><div className="d-card-sub">Сьогодні</div></div></div>
                    <div>
                      <div className="d-row"><div className="d-av" style={{background:'var(--violet)'}}>АК</div><div><div className="d-name">Анна Коваленко</div><div className="d-svc">Манікюр + покриття</div></div><div className="d-time">09:00</div><div className="d-status st-ok">Підтв.</div></div>
                      <div className="d-row"><div className="d-av" style={{background:'var(--rose)'}}>МП</div><div><div className="d-name">Марія Петренко</div><div className="d-svc">Нарощування</div></div><div className="d-time">10:30</div><div className="d-status st-wait">Очік.</div></div>
                      <div className="d-row"><div className="d-av" style={{background:'var(--amber)'}}>ОС</div><div><div className="d-name">Олена Сидорук</div><div className="d-svc">Педикюр апаратний</div></div><div className="d-time">12:00</div><div className="d-status st-ok">Підтв.</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="calc" id="calculator">
        <div className="calc-wrap">
          <div className="calc-hd">
            <span className="eyebrow">Калькулятор втрат</span>
            <h2>Скільки ви втрачаєте <span className="gt">щомісяця</span>?</h2>
            <p>Рухайте слайдери — побачите реальну картину втрат вашого салону без CRM</p>
          </div>
          <div className="calc-box">
            <div className="calc-grid">
              <div className="calc-inputs">
                <div className="calc-field">
                  <label>Кількість майстрів</label>
                  <div className="range-current">{masters}</div>
                  <input type="range" min="1" max="15" value={masters} onChange={e => setMasters(Number(e.target.value))} />
                  <div className="range-vals"><span>1</span><span>15</span></div>
                </div>
                <div className="calc-field">
                  <label>Записів на день (на майстра)</label>
                  <div className="range-current">{bookings}</div>
                  <input type="range" min="2" max="12" value={bookings} onChange={e => setBookings(Number(e.target.value))} />
                  <div className="range-vals"><span>2</span><span>12</span></div>
                </div>
                <div className="calc-field">
                  <label>Середній чек, ₴</label>
                  <div className="range-current">₴{formatNumber(avgCheck)}</div>
                  <input type="range" min="300" max="3000" step="50" value={avgCheck} onChange={e => setAvgCheck(Number(e.target.value))} />
                  <div className="range-vals"><span>₴300</span><span>₴3 000</span></div>
                </div>
              </div>
              <div className="calc-results">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--rose)'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Ваші щомісячні втрати
                </h3>
                <div className="loss-item"><span className="loss-label">No-show (12% записів)</span><span className="loss-value">₴{formatNumber(lossNoshow)}</span></div>
                <div className="loss-item"><span className="loss-label">Втрата клієнтів (34%)</span><span className="loss-value">₴{formatNumber(lossChurn)}</span></div>
                <div className="loss-item"><span className="loss-label">Перевитрата матеріалів</span><span className="loss-value">₴{formatNumber(lossMaterials)}</span></div>
                <div className="loss-item"><span className="loss-label">Час на рутину (3 год/день)</span><span className="loss-value">₴{formatNumber(lossTime)}</span></div>
                <div className="loss-total">
                  <div className="loss-total-label">Загальні втрати на місяць</div>
                  <div className="loss-total-value">₴{formatNumber(lossTotal)}</div>
                  <div className="loss-total-sub">Це можна повернути з ShinePRO</div>
                </div>
                <div className="calc-cta">
                  <a href="#cta" className="btn-p">
                    Перестати втрачати гроші
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat" id="features">
        <div className="feat-hd">
          <span className="eyebrow">Можливості</span>
          <h2>Не просто CRM, а операційна система вашого салону</h2>
          <p>Кожна функція вирішує конкретну бізнес-проблему і приносить вимірюваний результат.</p>
        </div>
        <div className="bento">
          <div className="bc bc-1">
            <div className="ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>Розумний календар з AI-оптимізацією</h3>
            <p>Система аналізує середню тривалість послуг і пропонує оптимальне розміщення записів. Мінус 40 хвилин простоїв на день.</p>
          </div>
          <div className="bc bc-2">
            <div className="ico ico-rose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3>Автоматизації</h3>
            <p>7 готових сценаріїв які працюють без вашої участі. No-show знижується з 12% до 2%.</p>
          </div>
          <div className="bc bc-3">
            <div className="ico ico-emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <h3>RFM-сегментація</h3>
            <p>Автоматичний поділ бази по лояльності. Кожен сегмент отримує свою стратегію повернення.</p>
          </div>
          <div className="bc bc-4">
            <div className="ico ico-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3>Склад</h3>
            <p>Техкарти автоматично списують матеріали. Повідомлення коли запас менше мінімуму.</p>
          </div>
          <div className="bc bc-5">
            <div className="ico ico-sky">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3>Фінанси</h3>
            <p>Зарплати, комісії, бонуси — автоматичний розрахунок. Monobank та ПриватБанк інтеграція.</p>
          </div>
          <div className="bc bc-6">
            <div className="ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <h3>Telegram-бот</h3>
            <p>Клієнти записуються через бот, отримують нагадування і залишають відгуки. 24/7 без адміністратора.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="pricing-hd">
          <span className="eyebrow">Тарифи</span>
          <h2>Прозорі ціни без <span className="gt">прихованих платежів</span></h2>
          <p>Оберіть план під ваш салон. Завжди можна змінити.</p>
        </div>
        <div className="pricing-toggle">
          <span className={!isAnnual ? 'active' : ''}>Щомісяця</span>
          <div className={`toggle-wrap ${isAnnual ? 'annual' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
            <div className="toggle-knob"></div>
          </div>
          <span className={isAnnual ? 'active' : ''}>Щорічно</span>
          <span className="save-badge">—20%</span>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-name">Start</div>
            <div className="price-desc">Для solo-майстрів та невеликих студій</div>
            <div className="price-amount">
              <span className="price-num">₴{formatNumber(isAnnual ? 399 : 499)}</span>
              <span className="price-period"> / міс</span>
            </div>
            <div className="price-features">
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>До 2 майстрів</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Онлайн-запис + календар</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Telegram-нагадування</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>База клієнтів до 500</div>
            </div>
            <a href="#cta" className="price-btn price-btn-outline">Почати безкоштовно</a>
          </div>
          <div className="price-card popular">
            <span className="popular-tag">Найпопулярніший</span>
            <div className="price-name">Pro</div>
            <div className="price-desc">Для салонів з командою та амбіціями</div>
            <div className="price-amount">
              <span className="price-num">₴{formatNumber(isAnnual ? 799 : 999)}</span>
              <span className="price-period"> / міс</span>
            </div>
            <div className="price-features">
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>До 8 майстрів</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>RFM-аналітика + автоматизації</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Telegram-бот для запису</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Склад + техкарти</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Фінанси + зарплати</div>
            </div>
            <a href="#cta" className="price-btn price-btn-primary">Почати безкоштовно</a>
          </div>
          <div className="price-card">
            <div className="price-name">Enterprise</div>
            <div className="price-desc">Для мереж салонів та франшиз</div>
            <div className="price-amount">
              <span className="price-num">₴{formatNumber(isAnnual ? 1999 : 2499)}</span>
              <span className="price-period"> / міс</span>
            </div>
            <div className="price-features">
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Необмежено майстрів</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Мультилокації</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>API + кастомні інтеграції</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Виділений менеджер</div>
            </div>
            <a href="#cta" className="price-btn price-btn-outline">Зв&apos;язатися з нами</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="test" id="reviews">
        <div className="test-hd">
          <span className="eyebrow">Відгуки</span>
          <h2>Що кажуть власники салонів</h2>
          <p>Реальні історії, конкретні цифри</p>
        </div>
        <div className="test-grid">
          <div className="tc-card">
            <div className="tc-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="tc-star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p className="tc-text">За перший місяць <strong>no-show впав з 14% до 2.3%</strong>. Це ₴23,000 які раніше просто зникали. Автонагадування в Telegram — найкраща інвестиція.</p>
            <div className="tc-author">
              <div className="tc-av-c" style={{background:'var(--violet)'}}>ОМ</div>
              <div><div className="tc-name">Олена М.</div><div className="tc-co">Nail-студія · Київ · 5 майстрів</div></div>
            </div>
          </div>
          <div className="tc-card">
            <div className="tc-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="tc-star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p className="tc-text">RFM-сегментація показала, що <strong>27% бази — «сплячі» клієнти</strong>. Запустили автоматичну реактивацію — повернули 68 клієнтів за місяць.</p>
            <div className="tc-author">
              <div className="tc-av-c" style={{background:'var(--rose)'}}>ІК</div>
              <div><div className="tc-name">Ірина К.</div><div className="tc-co">Beauty Space · Одеса · 3 майстри</div></div>
            </div>
          </div>
          <div className="tc-card">
            <div className="tc-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="tc-star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p className="tc-text">Техкарти з автосписанням — <strong>щомісячна економія ₴12,000 на матеріалах</strong>. Раніше зливали на перевитрату. Тепер кожен грам під контролем.</p>
            <div className="tc-author">
              <div className="tc-av-c" style={{background:'var(--amber)'}}>АШ</div>
              <div><div className="tc-name">Анастасія Ш.</div><div className="tc-co">Nail Bar · Харків · 7 майстрів</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="faq-hd">
          <span className="eyebrow">FAQ</span>
          <h2>Часті запитання</h2>
          <p>Не знайшли відповідь? Напишіть нам в Telegram — відповімо за 5 хвилин.</p>
        </div>
        <div className="faq-list">
          {[
            { q: 'Скільки часу займає налаштування?', a: 'Реєстрація займає 5 хвилин. Базове налаштування з додаванням послуг і майстрів — 15 хвилин. Якщо у вас є база клієнтів в Excel або іншій CRM, ми безкоштовно допоможемо перенести її протягом 24 годин.' },
            { q: 'Чи потрібно встановлювати щось на комп\'ютер?', a: 'Ні. ShinePRO працює в браузері та як PWA-додаток на телефоні. Заходите з будь-якого пристрою — всі дані синхронізуються автоматично.' },
            { q: 'Як працює Telegram-бот для клієнтів?', a: 'Клієнт знаходить бот вашого салону в Telegram, бачить вільні слоти, обирає майстра та послугу, підтверджує запис. За 2 години до візиту отримує нагадування.' },
            { q: 'Що якщо мені не підійде?', a: '14 днів безкоштовного тріалу без прив\'язки картки. Якщо не підійде — просто не продовжуйте. Жодних зобов\'язань.' },
          ].map((item, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q">
                <span>{item.q}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div className="faq-a" style={{maxHeight: openFaq === i ? '200px' : 0}}>
                <div className="faq-a-in">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="cta">
        <div className="cta-glow"></div>
        <div className="cta-c">
          <h2>Перестаньте рахувати в Excel.<br/>Почніть <span className="gt">заробляти більше</span></h2>
          <p className="cta-desc">Залиште заявку — ми допоможемо налаштувати все за вас. Безкоштовно.</p>
          <form className="lead-form" onSubmit={handleSubmit}>
            <div className="lead-row">
              <input type="text" placeholder="Ваше ім'я" required />
              <input type="tel" placeholder="+380 XX XXX XX XX" required />
            </div>
            <div className="lead-row">
              <input type="text" placeholder="Назва салону" />
            </div>
            <button type="submit" className="lead-submit">Отримати безкоштовний доступ</button>
            <div className="lead-note">14 днів безкоштовно · Без картки · Налаштування за 5 хвилин</div>
          </form>
          <div className="cta-feats">
            <div className="cta-f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Без картки</div>
            <div className="cta-f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Без зобов&apos;язань</div>
            <div className="cta-f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Підтримка 24/7</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-in">
          <div className="foot-l">
            <Link href="/" className="logo">
              <div className="logo-mark"><span>S</span></div>
              <span className="logo-name">ShinePRO</span>
            </Link>
            <span className="foot-copy">© 2026 ShinePRO. Всі права захищені.</span>
          </div>
          <div className="foot-links">
            <a href="#">Конфіденційність</a>
            <a href="#">Умови</a>
            <a href="#">Підтримка</a>
          </div>
        </div>
      </footer>

      {/* TOAST */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Заявку надіслано! Зв&apos;яжемося з вами за 5 хвилин.</span>
      </div>
    </>
  )
}
