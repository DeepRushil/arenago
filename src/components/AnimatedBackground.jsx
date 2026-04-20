export default function AnimatedBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      background: '#06081a',
    }}>
      <iframe
        src="https://www.youtube.com/embed/7kWXaYHBhC4?autoplay=1&mute=1&loop=1&playlist=7kWXaYHBhC4&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0"
        title="ISL 10th Year Background"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          /* scale up to cover entire viewport at any aspect ratio */
          width: '100vw',
          height: '56.25vw',     /* 16:9 ratio */
          minHeight: '100vh',
          minWidth: '177.78vh',  /* 16:9 ratio inverted */
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          filter: 'brightness(0.45)',
        }}
      />
      {/* Gradient overlay for card legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(6,8,26,0.5) 0%, rgba(6,8,26,0.75) 100%)',
      }} />
    </div>
  );
}

