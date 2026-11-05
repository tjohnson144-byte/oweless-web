import React,{ Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowDown, Wind, WindOff, Compass, ShieldCheck, Sprout, Scale, Heart, Menu, X, Play, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CinematicWorld from './World.jsx';

gsap.registerPlugin(ScrollTrigger);
const PATHFINDER_URL = 'https://oweless-71275.bubbleapps.io/version-test/cinematic-pathfinder';
const stages=[
  {name:'Feel stuck?',explain:'When debt feels overwhelming, the next step can seem impossible.',alt:'A traveler beginning a journey under magenta cherry blossoms'},
  {name:'Explore options',explain:'Discover different debt strategies and understand their trade-offs.',alt:'A signpost at a crossroads of golden pathways'},
  {name:'Find your path',explain:'See which directions may make sense for your situation.',alt:'A glowing compass pointing the way forward'},
  {name:'More life ahead',explain:'Move forward with more clarity and a plan worth pursuing.',alt:'A sunlit city at the end of the journey'},
];
function supportsWebGL(){try{const canvas=document.createElement('canvas');return !!(window.WebGL2RenderingContext&&canvas.getContext('webgl2'))}catch{return false}}
function useReducedMotion(){const [reduce,setReduce]=useState(()=>typeof window!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const cb=()=>setReduce(m.matches);m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb)},[]);return reduce;}
function App(){
  const reduced=useReducedMotion();
  const [motion,setMotion]=useState(()=>!(typeof window!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches));
  const [menuOpen,setMenuOpen]=useState(false);
  const [webgl,setWebgl]=useState(false);
  const [worldFailed,setWorldFailed]=useState(false);
  const lowPower=typeof navigator!=='undefined'&&(/Android|iPhone|iPad/i.test(navigator.userAgent)||((navigator.hardwareConcurrency??8)<6));
  useEffect(()=>setWebgl(supportsWebGL()),[]);
  useEffect(()=>{if(reduced)setMotion(false)},[reduced]);
  useEffect(()=>{
    if(reduced)return;
    const ctx=gsap.context(()=>{
      gsap.fromTo('.hero-copy > *',{y:25,opacity:0},{y:0,opacity:1,duration:.9,stagger:.12,ease:'power2.out'});
      gsap.utils.toArray('.story-heading, .milestone, .principle, .footer-cta').forEach(el=>{
        gsap.fromTo(el,{y:38,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      });
      gsap.fromTo('.journey-line-fill',{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:'.milestones',start:'top 80%',end:'bottom 30%',scrub:true}});
    });return()=>ctx.revert();
  },[reduced]);
  return <div className="site" id="home">
    <header className="nav"><a className="logo" href="#home" aria-label="OweLess home"><span className="logo-script">Owe<span>Less</span></span><span className="logo-sub">PATHFINDER</span></a>
      <nav aria-label="Primary navigation" className={menuOpen?'nav-items open':'nav-items'}><a href="#story" onClick={()=>setMenuOpen(false)}>How It Works</a><a href="#possibilities" onClick={()=>setMenuOpen(false)}>Your Options</a><a href="#difference" onClick={()=>setMenuOpen(false)}>Why OweLess</a></nav>
      <div className="nav-actions"><button type="button" className="motion-btn" onClick={()=>setMotion(m=>!m)} aria-label={motion?'Turn off animations':'Turn on animations'} title={motion?'Pause scene':'Play scene'}>{motion?<Wind size={18}/>:<WindOff size={18}/>}</button><a className="pill nav-primary" href={PATHFINDER_URL}>Find My Path <ArrowRight size={17}/></a><button className="menu-btn" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(m=>!m)}>{menuOpen?<X/>:<Menu/>}</button></div>
    </header>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-atmosphere" aria-hidden="true"/>
        <div className="hero-art" aria-hidden="true"/>
        <div className="world-container" aria-hidden="true">{webgl&&!worldFailed&&<Suspense fallback={null}><CinematicWorld running={motion&&!reduced} lowPower={lowPower} onError={()=>setWorldFailed(true)}/></Suspense>}</div>
        <div className="hero-vignette" aria-hidden="true"/>
        <div className="hero-copy"><span className="eyebrow">YOUR JOURNEY TO FINANCIAL FREEDOM</span><h1 id="hero-title">Less debt.<em>More life.</em></h1><p>Your journey to financial freedom starts here. Discover the possibilities, understand the trade-offs, and find a clearer way forward.</p><div className="hero-actions"><a className="pill pink" href={PATHFINDER_URL}>Find My Path <ArrowRight size={18}/></a><a className="pill glass" href="#story"><Play size={15}/> Discover Pathfinder</a></div></div>
        <a className="scroll-cue" href="#story">THE JOURNEY <ArrowDown size={15}/></a>
      </section>
      <section className="story" id="story" aria-labelledby="story-title">
        <div className="story-heading"><span className="overline">FOLLOW THE GOLDEN PATH</span><h2 id="story-title">The <em>Pathfinder Journey</em></h2><p>From uncertainty to possibility—in four simple steps.</p></div>
        <div className="milestones" id="possibilities"><div className="journey-line" aria-hidden="true"><div className="journey-line-fill"/></div>
          {stages.map((s,i)=><article className="milestone" key={s.name}><div className="medallion"><img src={`/assets/milestone-${i+1}.webp`} alt={s.alt} loading="lazy"/><span className="stage-number">{i+1}</span></div><h3>{s.name}</h3><p>{s.explain}</p></article>)}
        </div><a className="pill pink story-cta" href={PATHFINDER_URL}>Explore My Options <ArrowRight size={17}/></a>
      </section>
      <section className="difference" id="difference" aria-labelledby="difference-title"><div className="difference-header"><span className="overline">THE OWELESS DIFFERENCE</span><h2 id="difference-title">A more beautiful way <em>forward.</em></h2><p>More than a destination. A clearer understanding of your options, with you in control.</p></div>
        <div className="principles"><article className="principle"><ShieldCheck/><h3>Transparent</h3><p>Understand potential costs and trade-offs before choosing a path.</p></article><article className="principle"><Compass/><h3>Guided</h3><p>Make sense of the choices available for your circumstances.</p></article><article className="principle"><Scale/><h3>Flexible</h3><p>Different circumstances call for different solutions.</p></article><article className="principle"><Heart/><h3>Consumer-first</h3><p>Your goals, your timeline, and your next chapter.</p></article></div>
      </section>
      <section className="final"><div className="final-flare" aria-hidden="true"/><div className="footer-cta"><span className="overline">YOUR NEXT CHAPTER</span><h2>Less debt. <em>More life.</em></h2><p>Every journey begins with a first step. Find out what your options might look like.</p><a className="pill pink" href={PATHFINDER_URL}>Find My Path <ArrowRight size={17}/></a></div><div className="compass-mark" aria-hidden="true"><Compass size={125} strokeWidth={.6}/></div></section>
    </main><footer><span className="footer-brand">OweLess</span><span>OweLess Cinematic 2.0 — design preview</span><small>Debt solutions have risks and eligibility requirements. Results are not guaranteed. Preview links to existing Bubble test Pathfinder; no data is submitted by this homepage.</small></footer>
  </div>
}
export default App;