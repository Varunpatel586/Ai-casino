interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div
      className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-between items-center py-2 sm:py-3 md:py-4 px-3 sm:px-4 selection:bg-amber-400 selection:text-black overflow-hidden"
      style={{
        background:
          'radial-gradient(circle 800px at 50% -80px, rgba(93, 173, 226, 0.18) 0%, transparent 60%), radial-gradient(ellipse 110% 60% at 50% 12%, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.16) 40%, transparent 75%), radial-gradient(circle 650px at 50% 95%, rgba(225, 29, 72, 0.32) 0%, rgba(136, 19, 55, 0.25) 45%, transparent 75%), linear-gradient(180deg, #0a060d 0%, #160a16 30%, #1a0a14 65%, #0b0409 100%)',
      }}
    >
      {/* BEGIN: Architectural Ceiling & Casino Structure Layers */}
      {/* Central Illuminated Skylight Dome with Soft Blue Glow & Golden Rim */}
      <div className="ceiling-skylight-dome" />
      <div className="ceiling-dome-ring" />

      {/* Concentric Glowing Vaulted Ribbed Arches with Marquee Incandescent Bulbs */}
      <div className="arch-canopy-container">
        {/* Outer Arch 1 (Widest canopy) */}
        <div className="arch-rib w-[1380px] h-[340px] -top-[120px] border-t-[8px] border-amber-500/50 shadow-[0_-8px_35px_rgba(245,158,11,0.55),inset_0_4px_20px_rgba(251,191,36,0.35)] flex justify-around px-28 pt-2">
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
        </div>
        {/* Mid Arch 2 (Warm Orange & Gold Structural Rib) */}
        <div className="arch-rib w-[1060px] h-[270px] -top-[80px] border-t-[7px] border-amber-400/60 shadow-[0_-6px_30px_rgba(251,191,36,0.65),inset_0_4px_16px_rgba(217,119,6,0.4)] flex justify-around px-20 pt-2">
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
        </div>
        {/* Inner Arch 3 (Intense Incandescent Crown) */}
        <div className="arch-rib w-[780px] h-[200px] -top-[45px] border-t-[6px] border-yellow-200/80 shadow-[0_-6px_35px_rgba(254,240,138,0.85),inset_0_3px_14px_rgba(245,158,11,0.5)] flex justify-around px-16 pt-1.5">
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
          <span className="marquee-bulb" />
        </div>
      </div>

      {/* Flanking Marquee Illuminated Side Pillars (Warm Golden Light Grids) */}
      <div className="column-luminaire-left" />
      <div className="column-luminaire-right" />

      {/* Perspective Floor Red & Amber Carpet Glow radiating upward from bottom center */}
      <div className="carpet-perspective-glow" />

      {/* Subtle luxury felt pattern in background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(251, 191, 36, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* END: Architectural Ceiling & Casino Structure Layers */}

      {/* BEGIN: Top Bar / Header Security Protocol */}
      <header className="w-full max-w-6xl flex justify-between items-center opacity-75 px-4 text-xs tracking-[0.25em] font-mono text-zinc-400 z-10 select-none shrink-0 py-0.5 sm:py-1">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]">♠</span>
          <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]">♥</span>
          <span className="text-amber-300">♦</span>
          <span className="text-zinc-300">♣</span>
        </div>
        <div className="hidden sm:block uppercase tracking-[0.3em] text-[10px] text-amber-200/80 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">
          ENC: 4096-BIT QUANTUM VAULT • SALON NO. 07
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-zinc-300">♣</span>
          <span className="text-amber-300">♦</span>
          <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]">♥</span>
          <span className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]">♠</span>
        </div>
      </header>
      {/* END: Top Bar / Header Security Protocol */}

      {/* BEGIN: Main Stage Container */}
      <main className="w-full max-w-4xl my-auto flex-1 min-h-0 flex flex-col justify-center items-center text-center z-10 py-1 sm:py-2">
        {/* BEGIN: Pill Badge */}
        <div
          className="mb-1.5 sm:mb-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b0d18]/90 border border-amber-400/45 shadow-[0_0_20px_rgba(245,158,11,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-md shrink-0"
          data-purpose="tournament-badge"
        >
          <span className="text-amber-300 text-xs sm:text-sm">✨</span>
          <span className="text-amber-300 font-mono font-semibold text-[11px] sm:text-xs tracking-[0.22em] uppercase drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            THE ULTIMATE AI CASINO TOURNAMENT
          </span>
        </div>
        {/* END: Pill Badge */}

        {/* BEGIN: Main Headlines */}
        <div className="space-y-0.5 mb-1 sm:mb-2 select-none shrink-0" data-purpose="hero-title">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.92] uppercase font-display white-metallic-text">
            THE AI
          </h1>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider leading-[0.92] uppercase font-display gold-metallic-text">
            CASINO
          </h2>
        </div>
        {/* END: Main Headlines */}

        {/* BEGIN: Subtitles & Proposition */}
        <div className="space-y-1 mb-2 sm:mb-3 max-w-xl px-2 shrink-0" data-purpose="hero-tagline">
          <p className="text-amber-50/95 text-sm sm:text-base md:text-lg font-serif font-normal tracking-wide leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Where Human Intuition Bets Against Artificial Intellect
          </p>
          <p className="text-amber-200/70 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase font-medium">
            PERCEPTION • DEDUCTION • HIGH-STAKES WAGERING
          </p>
        </div>
        {/* END: Subtitles & Proposition */}

        {/* BEGIN: Feature Cards Grid with Floor Underglow */}
        <div className="relative w-full max-w-3xl px-2 my-1 sm:my-2 shrink-0">
          {/* Pooled Light Underglow Beneath the 3 Cards */}
          <div className="cards-floor-underglow" />
          <section className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4 w-full relative z-10" data-purpose="tournament-metrics">
            {/* Card 1: Bankroll */}
            <article
              className="casino-vip-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left flex flex-col justify-between min-h-[110px] sm:min-h-[125px] overflow-hidden group shadow-lg"
              data-purpose="metric-card-bankroll"
            >
              <div className="card-neon-edge" />
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-colors pointer-events-none" />
              {/* Header row inside card */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-amber-200/80 font-bold">
                  BUY-IN BANKROLL
                </span>
                {/* Gold Coins / Chips Icon */}
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="9" cy="9" r="6" />
                    <circle cx="15" cy="15" r="6" />
                  </svg>
                </div>
              </div>
              {/* Metric & description */}
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none">
                  $50
                </div>
                <p className="text-zinc-300 text-[11px] sm:text-xs mt-0.5 font-normal tracking-normal">
                  Virtual starting chips
                </p>
              </div>
            </article>

            {/* Card 2: Tournament Stages */}
            <article
              className="casino-vip-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left flex flex-col justify-between min-h-[110px] sm:min-h-[125px] overflow-hidden group shadow-lg"
              data-purpose="metric-card-stages"
            >
              <div className="card-neon-edge" />
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/15 rounded-full blur-2xl group-hover:bg-rose-500/25 transition-colors pointer-events-none" />
              {/* Header row inside card */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-amber-200/80 font-bold">
                  TOURNAMENT STAGES
                </span>
                {/* AI Brain / Flask Icon */}
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.35)]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L4.2 15.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              {/* Metric & description */}
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none">
                  3 Rounds
                </div>
                <p className="text-zinc-300 text-[11px] sm:text-xs mt-0.5 font-normal tracking-normal">
                  Vision, Video &amp; Live Chat
                </p>
              </div>
            </article>

            {/* Card 3: Vault Games */}
            <article
              className="casino-vip-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left flex flex-col justify-between min-h-[110px] sm:min-h-[125px] overflow-hidden group shadow-lg"
              data-purpose="metric-card-vault"
            >
              <div className="card-neon-edge" />
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-colors pointer-events-none" />
              {/* Header row inside card */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-amber-200/80 font-bold">
                  HIGH-ROLLER VAULT
                </span>
                {/* Trophy Icon */}
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004-6.75V4.875c0-.621-.504-1.125-1.125-1.125H9.75c-.621 0-1.125.504-1.125 1.125v3.75m7.5 0A4.875 4.875 0 0111.25 13.5h-1.5A4.875 4.875 0 014.875 8.625V5.25A1.5 1.5 0 016.375 3.75h1.125m9 0h1.125A1.5 1.5 0 0119.125 5.25v3.375a4.875 4.875 0 01-1.5 3.568"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              {/* Metric & description */}
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none">
                  Bonus Games
                </div>
                <p className="text-zinc-300 text-[11px] sm:text-xs mt-0.5 font-normal tracking-normal">
                  Wheel, Cards, Dice &amp; Mines
                </p>
              </div>
            </article>
          </section>
        </div>
        {/* END: Feature Cards Grid */}

        {/* BEGIN: Primary Action Button */}
        <div className="w-full flex flex-col items-center px-2 mt-1 sm:mt-2 shrink-0" data-purpose="cta-container">
          <button
            onClick={onStart}
            className="btn-marquee-gold w-full max-w-sm sm:max-w-md py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl flex items-center justify-center gap-3 text-black font-extrabold text-sm sm:text-base tracking-[0.16em] uppercase cursor-pointer select-none group border border-amber-200/50 shadow-tactile active:translate-y-0.5 transition-transform"
            role="button"
            type="button"
          >
            <span>ENTER CASINO FLOOR</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                clipRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                fillRule="evenodd"
              />
            </svg>
          </button>
          {/* Security / Provably Fair Guarantee Subtext */}
          <div
            className="mt-2 sm:mt-3 flex items-center justify-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-0.5 text-zinc-400 text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase"
            data-purpose="security-badges"
          >
            <span className="text-zinc-400">SECURE PROTOCOL</span>
            <span className="text-amber-400 font-bold">•</span>
            <span className="text-zinc-300">100% PROVABLY COMPETITIVE</span>
            <span className="text-amber-400 font-bold">•</span>
            <span className="text-zinc-400">GLOBAL LEADERBOARD</span>
          </div>
        </div>
        {/* END: Primary Action Button */}
      </main>
      {/* END: Main Stage Container */}

      {/* BEGIN: Bottom Footer / Verification Bar */}
      <footer
        className="w-full max-w-6xl flex justify-between items-center opacity-75 px-4 text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-zinc-400 z-10 select-none shrink-0 py-0.5 sm:py-1"
        data-purpose="site-footer"
      >
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="uppercase text-zinc-300 font-medium">LIVE EVENT PROTOCOL ACTIVE</span>
        </div>
        <div className="hidden sm:block uppercase tracking-[0.3em] text-amber-200/70">
          MONACO S-CLASS CERTIFIED • MAYFAIR SUITE
        </div>
      </footer>
      {/* END: Bottom Footer / Verification Bar */}
    </div>
  );
}
