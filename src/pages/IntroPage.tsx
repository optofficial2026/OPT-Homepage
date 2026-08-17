import { useEffect } from 'react';

const depth = ['모델의 원리', '수학적 기반', '데이터', '구현 과정'];

export default function IntroPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.intro-page .reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const heroImage = `${import.meta.env.BASE_URL}about-hero.png`;

  return <main className="intro-page" aria-label="소개">
    <section className="intro-hero">
      <div className="intro-glow intro-glow-lime" aria-hidden="true" />
      <div className="intro-glow intro-glow-cyan" aria-hidden="true" />
      <div className="wrap intro-wrap">
        <p className="intro-kicker reveal">// ABOUT OPT</p>
        <h1 className="reveal">느리지만 멈추지 않고,<br /><span>Global Optimum</span>을 향해</h1>
        <p className="intro-lede reveal">AI 연합 학회 OPT가 공부를 대하는 방식</p>
        <figure className="intro-hero-media reveal">
          <img src={heroImage} alt="푸른 곡선을 따라 나아가는 토끼와 거북이" />
          <div className="intro-hero-overlay" aria-hidden="true" />
          <figcaption><strong>DESCENDING TOWARD GLOBAL OPTIMUM</strong><span>OPT · 토끼와 거북이</span></figcaption>
        </figure>
      </div>
    </section>
    <section className="wrap intro-section"><div className="intro-two"><div className="reveal"><p className="intro-section-label">01 / FABLE</p><h2>토끼와<br />거북이</h2></div><div className="intro-section-copy reveal"><p>'토끼와 거북이'에서 토끼는 빠르게 앞서가지만 중간에 멈춰 섭니다. 반면, 거북이는 느리지만 멈추지 않고 계속해서 나아가 결국 경주에서 승리합니다.</p></div></div></section>
    <section className="wrap intro-section"><div className="intro-two"><div className="reveal"><p className="intro-section-label">02 / HOW WE LEARN</p><h2>한 걸음씩<br />더 깊게</h2></div><div className="intro-section-copy reveal"><p>OPT는 AI를 단순히 유행하는 기술의 소비만으로 바라보지 않습니다. 우리는 <strong>모델의 원리</strong>, <strong>수학적 기반</strong>, <strong>데이터와 구현 과정</strong>을 함께 공부하며 한 걸음씩 더 깊게 내려갑니다.</p><div className="intro-tags">{depth.map((item) => <span key={item}>{item}</span>)}</div></div></div></section>
    <section className="wrap intro-section intro-section-last"><div className="intro-two"><div className="reveal"><p className="intro-section-label">03 / WHY "OPT"</p><h2>Local이 아닌<br />Global로</h2></div><div className="intro-section-copy"><p className="reveal">Optimization에서 <strong>Local Optimum</strong>은 가까운 곳에서 찾은 그럴듯한 해답이고, <strong className="intro-lime">Global Optimum</strong>은 우리가 도달 가능한 가장 좋은 해답입니다. 토끼가 가까운 Local Optimum에 만족해 멈춰 있을 때, 우리는 거북이처럼 차근차근 더 깊이 탐구하며 더 좋은 해답을 찾아갑니다.</p><div className="intro-curve-card reveal"><svg viewBox="0 0 640 240" role="img" aria-labelledby="intro-curve-title intro-curve-description"><title id="intro-curve-title">Local Optimum에서 Global Optimum으로 내려가는 손실 곡선</title><desc id="intro-curve-description">토끼가 멈춘 Local Optimum보다 더 낮은 Global Optimum을 향해 곡선이 내려간다.</desc><path d="M20 40 C 90 40, 110 128, 180 128 C 230 128, 240 96, 285 96 C 340 96, 360 208, 440 208 C 520 208, 560 90, 620 60" fill="none" stroke="#d9f99d" strokeWidth="2.5" strokeLinecap="round" /><line x1="180" y1="128" x2="180" y2="176" stroke="rgba(103,232,249,0.35)" strokeWidth="1" strokeDasharray="3 4" /><circle cx="180" cy="128" r="7" fill="#67e8f9" /><text x="180" y="196" textAnchor="middle" fill="#67e8f9" fontFamily="Space Mono,monospace" fontSize="13" fontWeight="700">LOCAL OPTIMUM</text><text x="180" y="214" textAnchor="middle" fill="#5c6274" fontFamily="Noto Sans KR,sans-serif" fontSize="12">토끼가 멈춘 곳</text><circle cx="440" cy="208" r="8" fill="#d9f99d" /><text x="440" y="236" textAnchor="middle" fill="#d9f99d" fontFamily="Space Mono,monospace" fontSize="13" fontWeight="700">GLOBAL OPTIMUM</text><text x="330" y="52" fill="#5c6274" fontFamily="Space Mono,monospace" fontSize="11" letterSpacing="1">LOSS ↓ · 깊이 내려갈수록 더 좋은 해답</text></svg></div><div className="intro-quote reveal"><p>처음에는 느려 보여도, 꾸준히 내려가다 보면<br /><span>Global Optimum에 가까워질 수 있다고 믿습니다</span></p></div></div></div></section>
  </main>;
}
