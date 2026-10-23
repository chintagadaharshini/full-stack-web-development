import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Sparkles, Bookmark, BookOpen, Users, ArrowUpRight, X, GraduationCap, SlidersHorizontal, Handshake, Check, Trash2 } from 'lucide-react';
import seedListings from './data.json';

const STORAGE_KEY = 'skillswap-listings-v1';
const categories = ['All skills', 'Programming', 'Design', 'Communication', 'Productivity'];
const emptyForm = { type: 'Offering', title: '', category: 'Programming', skill: '', name: '', year: '2nd year CSE', mode: 'Online', description: '' };

function loadListings() {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : seedListings; }
  catch { return seedListings; }
}

function App() {
  const [listings, setListings] = useState(loadListings);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All skills');
  const [type, setType] = useState('Everything');
  const [savedOnly, setSavedOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(listings)); }, [listings]);

  const filtered = useMemo(() => listings.filter(item => {
    const text = `${item.title} ${item.skill} ${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (category === 'All skills' || item.category === category) && (type === 'Everything' || item.type === type) && (!savedOnly || item.saved);
  }), [listings, query, category, type, savedOnly]);

  const offers = listings.filter(x => x.type === 'Offering').length;
  const requests = listings.filter(x => x.type === 'Looking for').length;
  const savedCount = listings.filter(x => x.saved).length;

  function toggleSaved(id) { setListings(prev => prev.map(item => item.id === id ? { ...item, saved: !item.saved } : item)); }
  function submitForm(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.skill.trim() || !form.name.trim() || !form.description.trim()) return;
    const initials = form.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const next = { ...form, id: `user-${Date.now()}`, initials, tags: [form.skill.trim(), form.category, form.type === 'Offering' ? 'Can teach' : 'Wants to learn'], saved: false, color: ['peach', 'blue', 'lilac', 'green'][listings.length % 4] };
    setListings(prev => [next, ...prev]); setForm(emptyForm); setShowForm(false); setQuery(''); setCategory('All skills'); setType('Everything'); setSavedOnly(false); setNotice('Your listing is live on the board.');
    window.setTimeout(() => setNotice(''), 2800);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="SkillSwap home"><span className="brand-mark"><Handshake size={22}/></span><span>skill<span className="brand-light">swap</span><small>STUDENT EXCHANGE</small></span></a>
      <div className="side-label">YOUR SPACE</div>
      <button className={`nav-item ${!savedOnly ? 'active' : ''}`} onClick={() => setSavedOnly(false)}><BookOpen size={18}/> Explore skills <span className="nav-count">{listings.length}</span></button>
      <button className={`nav-item ${savedOnly ? 'active' : ''}`} onClick={() => setSavedOnly(true)}><Bookmark size={18}/> Saved for later <span className="nav-count">{savedCount}</span></button>
      <div className="side-note"><div className="note-icon"><Sparkles size={18}/></div><strong>Everyone knows something.</strong><p>Your next skill might be one conversation away.</p><button onClick={() => setShowForm(true)}>Share a skill <ArrowUpRight size={15}/></button></div>
      <div className="sidebar-bottom"><div className="mini-avatar">S</div><div><strong>Student community</strong><span>Learn together, grow together</span></div></div>
    </aside>

    <main id="top" className="main-content">
      <header className="topbar"><div className="breadcrumb">Campus / <strong>Skill exchange</strong></div><div className="topbar-right"><span className="live-dot"/> Community board <div className="user-avatar">S</div></div></header>
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> THE CAMPUS SKILL EXCHANGE</div><h1>Learn something.<br/><em>Teach something.</em></h1><p>A place for students to trade knowledge, find study buddies, and get better together. No money. Just shared skills.</p><div className="hero-actions"><button className="primary-button" onClick={() => setShowForm(true)}><Plus size={18}/> Create a listing</button><button className="text-button" onClick={() => { setSavedOnly(false); document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore the board <ArrowUpRight size={16}/></button></div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-card card-back"><span>SHARE</span><div className="art-lines"><i/><i/><i/></div></div><div className="art-card card-front"><div className="art-spark"><Sparkles size={22}/></div><span className="art-caption">GOOD THINGS<br/>GROW WHEN<br/><b>SHARED.</b></span><div className="art-avatars"><i>A</i><i>M</i><i>R</i><span>+42</span></div></div><div className="floating-bubble bubble-top"><BookOpen size={16}/></div><div className="floating-bubble bubble-bottom"><Handshake size={17}/></div></div></section>

      <section className="stats-grid" aria-label="Community statistics"><div className="stat-card"><span className="stat-icon purple"><BookOpen size={18}/></span><div><span className="stat-label">ACTIVE LISTINGS</span><strong>{listings.length.toString().padStart(2, '0')}</strong><small>Ideas in motion</small></div></div><div className="stat-card"><span className="stat-icon orange"><Sparkles size={18}/></span><div><span className="stat-label">SKILLS TO LEARN</span><strong>{requests.toString().padStart(2, '0')}</strong><small>Requests from students</small></div></div><div className="stat-card"><span className="stat-icon green"><Users size={18}/></span><div><span className="stat-label">SKILLS TO SHARE</span><strong>{offers.toString().padStart(2, '0')}</strong><small>People ready to help</small></div></div></section>

      <section id="discover" className="discover-section"><div className="section-heading"><div><div className="eyebrow muted">FIND YOUR NEXT THING</div><h2>{savedOnly ? 'Saved listings' : 'Discover the board'} <span className="result-count">{filtered.length}</span></h2><p>Small skills can lead to big opportunities.</p></div><button className="outline-button" onClick={() => setShowForm(true)}><Plus size={17}/> Add listing</button></div>
        <div className="toolbar"><label className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try ‘Figma’, ‘Python’, or a name..."/><kbd>⌕</kbd></label><label className="filter-select"><SlidersHorizontal size={16}/><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">{categories.map(c => <option key={c}>{c}</option>)}</select></label></div>
        <div className="chip-row">{['Everything', 'Offering', 'Looking for'].map(item => <button key={item} onClick={() => setType(item)} className={`filter-chip ${type === item ? 'selected' : ''}`}>{item === 'Offering' ? '✳ ' : item === 'Looking for' ? '↗ ' : ''}{item}</button>)}<span className="toolbar-spacer"/>{savedOnly && <button className="clear-filters" onClick={() => setSavedOnly(false)}>Show all listings <X size={13}/></button>}<span className="sort-label">Recently shared <span>⌄</span></span></div>
        {filtered.length ? <div className="listing-grid">{filtered.map(item => <article className="listing-card" key={item.id}><div className="listing-top"><span className={`type-pill ${item.type === 'Offering' ? 'offer' : 'request'}`}><span/>{item.type}</span><button className={`save-button ${item.saved ? 'is-saved' : ''}`} onClick={() => toggleSaved(item.id)} aria-label={item.saved ? 'Remove saved listing' : 'Save listing'} title={item.saved ? 'Remove saved listing' : 'Save listing'}><Bookmark size={18} fill={item.saved ? 'currentColor' : 'none'}/></button></div><div className="listing-category">{item.category.toUpperCase()} <span>·</span> {item.skill}</div><h3>{item.title}</h3><p className="listing-description">{item.description}</p><div className="tag-list">{item.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div><div className="listing-footer"><div className="student-info"><div className={`student-avatar ${item.color}`}>{item.initials}</div><div><strong>{item.name}</strong><span>{item.year}</span></div></div><button className="connect-button" onClick={() => setNotice(`In a full version, you would contact ${item.name} here.`)}>Connect <ArrowUpRight size={14}/></button></div>{item.id.startsWith('user-') && <button className="delete-listing" onClick={() => setListings(prev => prev.filter(x => x.id !== item.id))}><Trash2 size={13}/> Delete your listing</button>}</article>)}</div> : <div className="empty-state"><div><Search size={23}/></div><h3>No matches yet</h3><p>Try another keyword or loosen your filters. Your perfect study buddy may be hiding under a different skill.</p><button className="outline-button" onClick={() => { setQuery(''); setCategory('All skills'); setType('Everything'); setSavedOnly(false); }}>Clear filters</button></div>}
        <div className="bottom-banner"><div className="banner-icon"><GraduationCap size={22}/></div><div><strong>Have a skill worth sharing?</strong><span>Help someone get one step closer to their goal.</span></div><button onClick={() => setShowForm(true)}>Post your skill <ArrowUpRight size={16}/></button></div>
      </section>
      <footer className="footer"><span>SKILLSWAP © 2026</span><span>Built for curious minds <span className="footer-heart">✳</span></span><span>LEARN · SHARE · REPEAT</span></footer>
    </main>

    {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow muted">ADD TO THE COMMUNITY</div><h2 id="modal-title">Create a listing</h2><p>Make it easy for another student to find you.</p></div><button className="close-modal" onClick={() => setShowForm(false)} aria-label="Close"><X size={20}/></button></div><form onSubmit={submitForm}><div className="form-toggle"><button type="button" className={form.type === 'Offering' ? 'chosen' : ''} onClick={() => setForm({ ...form, type: 'Offering' })}><Sparkles size={16}/> I can teach</button><button type="button" className={form.type === 'Looking for' ? 'chosen' : ''} onClick={() => setForm({ ...form, type: 'Looking for' })}><BookOpen size={16}/> I want to learn</button></div><label>Listing title<input required maxLength="70" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Intro to Python for beginners"/></label><div className="form-two"><label>Skill<input required value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} placeholder="e.g. Python"/></label><label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select></label></div><div className="form-two"><label>Your name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rakesh K."/></label><label>Year / course<input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2nd year CSE"/></label></div><label>Meet-up preference<select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}><option>Online</option><option>On campus</option><option>Online or campus</option><option>Campus library</option></select></label><label>Tell us a little more<textarea required maxLength="260" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What would you like to teach or learn?"/></label><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-button"><Check size={17}/> Publish listing</button></div></form></section></div>}
    {notice && <div className="toast"><Check size={17}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15}/></button></div>}
  </div>;
}

export default App;
