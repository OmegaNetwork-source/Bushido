import React, { useState } from 'react';

export default function Landing({ onEnterGame, onSelectGame }) {
  const [showPreview, setShowPreview] = useState(false);

  const previewImages = [
    'https://i.postimg.cc/kV9Q03St/1.png',
    'https://i.postimg.cc/DJp14SN3/2.png',
    'https://i.postimg.cc/bst1dNHm/3.png',
    'https://i.postimg.cc/mP3MNXny/4.png'
  ];

  return (
    <div style={{ 
      fontFamily: 'Georgia, serif',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%)',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <header style={{
        textAlign: 'center',
        padding: '30px 20px 25px',
        borderTop: '25px solid #533483',
        borderBottom: '15px solid #0f3460',
        color: '#fff',
        background: 'rgba(15, 52, 96, 0.3)'
      }}>
        <h1 style={{
          fontSize: window.innerWidth > 768 ? '3em' : '1.8em',
          letterSpacing: '3px',
          fontFamily: "'Cinzel Decorative', serif",
          background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 'bold',
          textShadow: 'none',
          margin: '0 0 8px 0'
        }}>Bushido</h1>
        <div style={{
          fontSize: window.innerWidth > 768 ? '3em' : '2em',
          marginTop: '5px',
          fontFamily: 'Georgia, serif',
          textShadow: '3px 3px 8px rgba(0,0,0,0.9)'
        }}>武士道</div>
        <p style={{
          fontSize: window.innerWidth > 768 ? '1.2em' : '0.9em',
          fontWeight: 'bold',
          fontFamily: "'Cinzel Decorative', serif",
          marginTop: '8px',
          marginBottom: '20px',
          color: '#00d4ff',
          textShadow: '2px 2px 8px rgba(0,212,255,0.5)'
        }}>The Way of the Warrior</p>
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          marginTop: '20px',
          maxWidth: '900px',
          margin: '20px auto 0 auto'
        }}>
          <button 
            onClick={() => setShowPreview(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: window.innerWidth > 768 ? '250px' : '160px',
              height: '75px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0f3460 100%)',
              color: '#fff',
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: window.innerWidth > 768 ? '1.3em' : '1em',
              padding: '12px 20px',
              border: '3px solid rgba(0,212,255,0.6)',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,212,255,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 40px rgba(0,212,255,0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,212,255,0.4)';
            }}
          >
            NFT Preview
          </button>
          <button 
            onClick={() => onSelectGame('bushido-duel')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: window.innerWidth > 768 ? '250px' : '160px',
              height: '75px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: '#fff',
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: window.innerWidth > 768 ? '1.3em' : '1em',
              padding: '12px 20px',
              border: '3px solid rgba(168,85,247,0.6)',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(168,85,247,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 40px rgba(236,72,153,0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(168,85,247,0.4)';
            }}
          >
            Battle
          </button>
          <button 
            onClick={() => onSelectGame('bushido-platformer')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: window.innerWidth > 768 ? '250px' : '160px',
              height: '75px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: window.innerWidth > 768 ? '1.3em' : '1em',
              padding: '12px 20px',
              border: '3px solid rgba(102,126,234,0.6)',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(102,126,234,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 40px rgba(118,75,162,0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(102,126,234,0.4)';
            }}
          >
            Coin Collector
          </button>
        </div>
      </header>

      <nav style={{
        background: 'rgba(15,52,96,0.5)',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '15px 0',
        borderTop: '3px solid #533483',
        borderBottom: '3px solid #533483'
      }}>
        <a href="#about" style={{ color: '#00d4ff', textDecoration: 'none', margin: window.innerWidth > 768 ? '0 20px' : '8px 15px', fontWeight: 'bold', fontFamily: 'Georgia, serif', transition: 'color 0.3s' }}>About</a>
        <a href="#manga" style={{ color: '#00d4ff', textDecoration: 'none', margin: window.innerWidth > 768 ? '0 20px' : '8px 15px', fontWeight: 'bold', fontFamily: 'Georgia, serif', transition: 'color 0.3s' }}>Manga</a>
        <a href="#fire" style={{ color: '#00d4ff', textDecoration: 'none', margin: window.innerWidth > 768 ? '0 20px' : '8px 15px', fontWeight: 'bold', fontFamily: 'Georgia, serif', transition: 'color 0.3s' }}>Fire Bushidos</a>
        <a href="#water" style={{ color: '#00d4ff', textDecoration: 'none', margin: window.innerWidth > 768 ? '0 20px' : '8px 15px', fontWeight: 'bold', fontFamily: 'Georgia, serif', transition: 'color 0.3s' }}>Water Bushidos</a>
        <a href="#virtues" style={{ color: '#00d4ff', textDecoration: 'none', margin: window.innerWidth > 768 ? '0 20px' : '8px 15px', fontWeight: 'bold', fontFamily: 'Georgia, serif', transition: 'color 0.3s' }}>Virtues</a>
      </nav>

      {/* Unified About & Clans Section */}
      <section style={{ 
        padding: window.innerWidth > 768 ? '60px 40px' : '30px 20px', 
        maxWidth: '1200px', 
        margin: '40px auto',
        background: 'rgba(15,52,96,0.3)', 
        borderRadius: '20px', 
        border: '2px solid rgba(83,52,131,0.3)'
      }}>
        {/* About Header */}
        <div id="about" style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5em', 
            fontFamily: "'Cinzel Decorative', serif", 
            marginBottom: '30px', 
            color: '#a855f7', 
            textShadow: '2px 2px 6px rgba(168,85,247,0.5)' 
          }}>About Bushido</h2>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '1.1em', 
            lineHeight: '1.8', 
            maxWidth: '900px', 
            margin: '0 auto',
            color: '#fff'
          }}>
            In a world forged by honor and flame, 1,500 warriors of the Fire Clan marched across the Somnia Network to confront their icy equals. Awaiting them: 1,500 elite Water Clan samurais, cloaked in mist and resolve. The battlefield echoed with the clash of elemental steel — fire roared against the tide, and vapor rose with every blade. It was a battle not of dominance, but of ancient balance, where each warrior embodied a virtue of Bushido. This was not just war — it was ceremony, sacrifice, and legacy written across a digital realm.
          </p>
        </div>

        {/* The Clans Title */}
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2.2em', 
          fontFamily: "'Cinzel Decorative', serif", 
          marginBottom: '40px', 
          color: '#00d4ff', 
          textShadow: '2px 2px 6px rgba(0,212,255,0.5)' 
        }}>The Clans</h2>

        {/* Fire & Water Side by Side */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
          gap: window.innerWidth > 768 ? '40px' : '30px'
        }}>
          {/* Fire Bushido */}
          <div id="fire" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              textAlign: 'center', 
              fontSize: '1.8em', 
              fontFamily: "'Cinzel Decorative', serif", 
              marginBottom: '25px', 
              color: '#ec4899', 
              textShadow: '2px 2px 6px rgba(236,72,153,0.5)' 
            }}>🔥 Fire Bushidos</h3>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <img 
                src="https://i.postimg.cc/P50z5f6k/fire.png" 
                alt="Fire Bushido Character" 
                style={{ 
                  maxWidth: '300px', 
                  width: '100%',
                  height: 'auto', 
                  borderRadius: '12px',
                  filter: 'drop-shadow(0 0 25px rgba(236,72,153,0.5))'
                }} 
              />
            </div>
            <p style={{ 
              textAlign: 'center', 
              lineHeight: '1.7',
              color: '#fff',
              fontSize: '1.05em'
            }}>
              The elite 1,500 samurais of the Fire Clan are forged in volcanic flame and unrelenting spirit. Masters of aggression and raw strength, they train beneath blazing suns and battle with the fury of a thousand ancestors. Their loyalty is as fierce as their strikes, and their code is scorched into their souls. Fire Bushidos do not waver — they erupt.
            </p>
          </div>

          {/* Water Bushido */}
          <div id="water" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              textAlign: 'center', 
              fontSize: '1.8em', 
              fontFamily: "'Cinzel Decorative', serif", 
              marginBottom: '25px', 
              color: '#00d4ff', 
              textShadow: '2px 2px 6px rgba(0,212,255,0.5)' 
            }}>💧 Water Bushidos</h3>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <img 
                src="https://i.postimg.cc/VvFDSyJW/water.png" 
                alt="Water Bushido Character" 
                style={{ 
                  maxWidth: '300px', 
                  width: '100%',
                  height: 'auto', 
                  borderRadius: '12px',
                  filter: 'drop-shadow(0 0 25px rgba(0,212,255,0.5))'
                }} 
              />
            </div>
            <p style={{ 
              textAlign: 'center', 
              lineHeight: '1.7',
              color: '#fff',
              fontSize: '1.05em'
            }}>
              Water Bushidos are 1,500 elite samurais born in silence, trained in stillness, and unleashed like crashing waves. Each step they take is calculated, each strike a reflection of patience refined. They do not shout; they flow. And when battle calls, they rise like the tide — enveloping, enduring, and ultimately overwhelming. Their calm is their power.
            </p>
          </div>
        </div>
      </section>

      <section id="manga" style={{ padding: window.innerWidth > 768 ? '60px 40px' : '30px 20px', maxWidth: '1400px', margin: 'auto', background: 'rgba(15,52,96,0.3)', borderRadius: '15px', marginTop: '40px', marginBottom: '40px', border: '2px solid rgba(83,52,131,0.3)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2em', fontFamily: "'Cinzel Decorative', serif", marginBottom: '20px', paddingBottom: '20px', color: '#a855f7', textShadow: '2px 2px 6px rgba(168,85,247,0.5)' }}>📖 Manga</h2>
        <p style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 20px auto' }}>Experience the legend of Bushido through vivid ink and panel. Our manga series dives deep into the elemental war between Fire and Water Bushidos, chronicling the path of chosen warriors, forbidden alliances, and the sacred virtues that bind them all. With every page, honor is tested, loyalty burns, and destiny flows like water. Stay tuned — the epic unfolds one chapter at a time.</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <img src="https://i.postimg.cc/N5Fbfc5s/manga.png" alt="Bushido Manga Page" style={{ width: '500px', maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 0 20px rgba(168,85,247,0.5)' }} />
        </div>
      </section>

      <section id="virtues" style={{ padding: window.innerWidth > 768 ? '60px 40px' : '30px 20px', maxWidth: '900px', margin: 'auto', background: 'rgba(15,52,96,0.3)', borderRadius: '15px', marginTop: '40px', marginBottom: '40px', border: '2px solid rgba(83,52,131,0.3)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2em', fontFamily: "'Cinzel Decorative', serif", marginBottom: '20px', paddingBottom: '20px', color: '#a855f7', textShadow: '2px 2px 6px rgba(168,85,247,0.5)' }}>The Seven Virtues of Bushido</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '30px' 
        }}>
          {[
            { kanji: '義', name: 'Gi', virtue: 'Integrity' },
            { kanji: '勇', name: 'Yuuki', virtue: 'Heroic Courage' },
            { kanji: '仁', name: 'Jin', virtue: 'Compassion' },
            { kanji: '礼', name: 'Rei', virtue: 'Respect' },
            { kanji: '誠', name: 'Makoto', virtue: 'Honesty and Sincerity' },
            { kanji: '名誉', name: 'Meiyo', virtue: 'Honor' },
            { kanji: '忠義', name: 'Chuugi', virtue: 'Duty and Loyalty' }
          ].map((v, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px' }}>
              <h3 style={{ fontSize: '2em', color: '#8c2d19', marginBottom: '10px' }}>{v.kanji}</h3>
              <p style={{ fontSize: '0.95em' }}><strong>{v.name}</strong> — {v.virtue}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '40px', background: 'rgba(15,52,96,0.5)', fontSize: '0.9em', color: '#00d4ff', fontFamily: 'Georgia, serif', borderTop: '3px solid #533483', marginTop: '60px' }}>
        <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>&copy; 2025 Bushido. All rights reserved.</p>
        <p style={{ marginBottom: '20px', color: '#a855f7', fontSize: '1.2em', fontWeight: 'bold' }}>⚡ Powered by Somnia Network ⚡</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="https://x.com/bushid0warrior?s=21&t=xVCZdrDlia_eMGUlcbqvGQ" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', transition: 'transform 0.3s' }}>
            <img src="https://abs.twimg.com/icons/apple-touch-icon-192x192.png" alt="X (formerly Twitter)" style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid #a855f7' }} />
          </a>
        </div>
      </footer>

      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />

      {/* Preview Modal */}
      {showPreview && (
        <div 
          onClick={() => setShowPreview(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            cursor: 'pointer'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #533483 100%)',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '3px solid rgba(0,212,255,0.5)',
              boxShadow: '0 20px 60px rgba(0,212,255,0.3)',
              cursor: 'default'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{
                color: '#00d4ff',
                fontSize: '2.5em',
                fontFamily: "'Cinzel Decorative', serif",
                textShadow: '2px 2px 8px rgba(0,212,255,0.5)',
                margin: 0
              }}>
                🎬 Bushido Preview
              </h2>
              <button 
                onClick={() => setShowPreview(false)}
                style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#c0392b';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#e74c3c';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
              gap: '30px'
            }}>
              {previewImages.map((imgUrl, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '15px',
                    padding: '15px',
                    border: '2px solid rgba(168,85,247,0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.border = '2px solid rgba(0,212,255,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.border = '2px solid rgba(168,85,247,0.3)';
                  }}
                >
                  <img 
                    src={imgUrl}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '10px',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML += `<div style="padding: 60px; text-align: center; color: #00d4ff; font-size: 1.2em;">Preview Image ${index + 1}<br/><small style="color: #a855f7; font-size: 0.8em;">Image loading...</small></div>`;
                    }}
                  />
                </div>
              ))}
            </div>

            <p style={{
              textAlign: 'center',
              color: '#00d4ff',
              marginTop: '30px',
              fontSize: '0.9em',
              fontStyle: 'italic'
            }}>
              Click outside or press the × button to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

