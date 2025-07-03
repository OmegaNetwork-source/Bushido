export default function GameHub({ onSelect }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 32 }}>
      <h2>Choose a Game</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
        <div
          style={{
            border: '2px solid #333',
            borderRadius: 12,
            padding: 24,
            width: 180,
            cursor: 'pointer',
            background: '#fafad2'
          }}
          onClick={() => onSelect('mario-platformer')}
        >
          <div style={{ fontSize: 48 }}>🏃‍♂️</div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>Bushido Escape</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>Run, jump, slash, and escape!</div>
        </div>
        <div
          style={{
            border: '2px solid #333',
            borderRadius: 12,
            padding: 24,
            width: 180,
            cursor: 'pointer',
            background: '#fafad2'
          }}
          onClick={() => {
            console.log('Slice button clicked');
            onSelect('fruit-ninja');
          }}
        >
          <div style={{ fontSize: 48 }}>🍉</div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>Slice</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>Slice the fruit!</div>
        </div>
        <div
          style={{
            border: '2px solid #333',
            borderRadius: 12,
            padding: 24,
            width: 180,
            cursor: 'pointer',
            background: '#fafad2'
          }}
          onClick={() => onSelect('ninja-dodge')}
        >
          <div style={{ fontSize: 48 }}>🥷</div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>Jump</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>Jump over rocks!</div>
        </div>
        <div
          style={{
            border: '2px solid #333',
            borderRadius: 12,
            padding: 24,
            width: 180,
            cursor: 'pointer',
            background: '#fafad2'
          }}
          onClick={() => onSelect('bushido-duel')}
        >
          <div style={{ fontSize: 48 }}>⚔️</div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>Bushido Duel</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>Turn-based battle!</div>
        </div>
      </div>
    </div>
  );
}