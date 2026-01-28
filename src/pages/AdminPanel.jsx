import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { X, Pencil, Trash2, Link2, UserPlus, Check, AlertCircle, Upload, Image as ImageIcon, Cake, MapPin, AtSign, Instagram, Twitter, MessageCircle } from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border animate-slide-up ${type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
      type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
        'bg-blue-500/20 border-blue-500/30 text-blue-400'
      }`}>
      {type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
};

// Image Dropzone Component
const ImageDropzone = ({ value, onChange, previewName }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
      setIsLoading(false);
    };
    reader.onerror = () => setIsLoading(false);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const previewSrc = value || (previewName ? `https://api.dicebear.com/7.x/initials/svg?seed=${previewName}` : '');

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-white/10 hover:border-white/30 bg-black/20'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {isLoading ? (
          <div className="py-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : previewSrc ? (
          <div className="flex items-center gap-4 w-full">
            <img src={previewSrc} className="w-16 h-16 rounded-full object-cover bg-slate-800" />
            <div className="flex-1 text-left">
              <p className="text-sm text-white">Image selected</p>
              <p className="text-xs text-gray-500">Drop new image or click to change</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">Drop image here or click to upload</p>
            <p className="text-xs text-gray-600">PNG, JPG, GIF up to 2MB</p>
          </>
        )}
      </div>

      {/* URL input fallback */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10"></div>
        <span className="text-xs text-gray-500">or paste URL</span>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>
      <input
        className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white text-sm"
        placeholder="https://example.com/photo.jpg"
        value={value?.startsWith('data:') ? '' : value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

// Edit Modal Component
const EditModal = ({ person, onClose, onSave }) => {
  const [name, setName] = useState(person.name);
  const [vibe, setVibe] = useState(person.vibe || '');
  const [img, setImg] = useState(person.img || '');
  const [bio, setBio] = useState(person.bio || '');
  const [birthday, setBirthday] = useState(person.birthday || '');
  const [location, setLocation] = useState(person.location || '');
  const [emoji, setEmoji] = useState(person.emoji || '');
  const [instagram, setInstagram] = useState(person.instagram || '');
  const [twitter, setTwitter] = useState(person.twitter || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...person,
      name,
      vibe,
      img: img || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      bio,
      birthday: birthday || null,
      location,
      emoji,
      instagram,
      twitter
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Basic Info */}
          <div className="flex gap-3">
            <input className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Name *" value={name} onChange={e => setName(e.target.value)} required />
            <input className="w-20 bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white text-center text-2xl" placeholder="😎" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
          </div>
          <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Vibe Tag" value={vibe} onChange={e => setVibe(e.target.value)} />

          {/* Bio */}
          <textarea className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white h-20 resize-none" placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Cake size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="date" className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" value={birthday} onChange={e => setBirthday(e.target.value)} />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>

          {/* Socials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
              <input className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Instagram" value={instagram} onChange={e => setInstagram(e.target.value)} />
            </div>
            <div className="relative">
              <Twitter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Twitter/X" value={twitter} onChange={e => setTwitter(e.target.value)} />
            </div>
          </div>

          <ImageDropzone value={img} onChange={setImg} previewName={name} />

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold p-3 rounded-lg transition">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-lg transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AdminPanel = ({ nodes, links = [], refreshData }) => {
  const [newName, setNewName] = useState('');
  const [newVibe, setNewVibe] = useState('');
  const [newImg, setNewImg] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newTwitter, setNewTwitter] = useState('');

  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState('friend');
  const [lore, setLore] = useState('');

  /* 2-step delete state */
  const [deletePersonId, setDeletePersonId] = useState(null);
  const [deleteBondId, setDeleteBondId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);
  const [activeTab, setActiveTab] = useState('people');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!newName) return;
    const imgUrl = newImg || `https://api.dicebear.com/7.x/initials/svg?seed=${newName}`;

    const { error } = await supabase
      .from('profiles')
      .insert([{
        name: newName,
        vibe: newVibe,
        img: imgUrl,
        bio: newBio,
        birthday: newBirthday || null,
        location: newLocation,
        emoji: newEmoji,
        instagram: newInstagram,
        twitter: newTwitter
      }]);

    if (error) showToast("Error adding person: " + error.message, 'error');
    else {
      setNewName(''); setNewVibe(''); setNewImg('');
      setNewBio(''); setNewBirthday(''); setNewLocation('');
      setNewEmoji(''); setNewInstagram(''); setNewTwitter('');
      showToast(`${newName} added to the universe!`);
      refreshData();
    }
  };

  const handleDeletePerson = async (person) => {
    if (deletePersonId !== person.id) {
      setDeletePersonId(person.id);
      return;
    }
    // Proceed with delete

    // First delete all relationships involving this person
    await supabase.from('relationships').delete().or(`source.eq.${person.id},target.eq.${person.id}`);

    // Then delete the person
    const { error } = await supabase.from('profiles').delete().eq('id', person.id);

    // Reset state
    setDeletePersonId(null);

    if (error) showToast("Error deleting: " + error.message, 'error');
    else {
      showToast(`${person.name} removed from the universe`);
      refreshData();
    }
  };

  const handleUpdatePerson = async (updatedPerson) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedPerson.name,
        vibe: updatedPerson.vibe,
        img: updatedPerson.img,
        bio: updatedPerson.bio,
        birthday: updatedPerson.birthday,
        location: updatedPerson.location,
        emoji: updatedPerson.emoji,
        instagram: updatedPerson.instagram,
        twitter: updatedPerson.twitter
      })
      .eq('id', updatedPerson.id);

    if (error) showToast("Error updating: " + error.message, 'error');
    else {
      showToast(`${updatedPerson.name} updated!`);
      setEditingPerson(null);
      refreshData();
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (sourceId === targetId || !sourceId || !targetId) {
      showToast("Please select two different people", 'error');
      return;
    }

    // Check for existing bond (handle objects vs strings)
    const exists = links.find(l => {
      const s = l.source?.id || l.source;
      const t = l.target?.id || l.target;
      return (s === sourceId && t === targetId) || (s === targetId && t === sourceId);
    });

    if (exists) {
      showToast("Bond already exists!", 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('relationships')
        .insert([{ source: sourceId, target: targetId, type: relType, lore: lore || "No lore yet." }]);

      if (error) {
        showToast("Error linking: " + error.message, 'error');
      } else {
        setLore('');
        // Reset selections for cleaner workflow
        // sourceId is kept sticky as requested
        setTargetId('');
        showToast("Bond forged!");
        setIsSubmitting(false); // Unlock immediately
        refreshData(); // Refresh in background
      }
    } catch (err) {
      console.error(err);
      showToast("Unexpected error: " + err.message, 'error');
    } finally {
      if (isSubmitting) setIsSubmitting(false);
    }
  };

  const handleDeleteRelationship = async (rel) => {
    if (deleteBondId !== rel.id) {
      setDeleteBondId(rel.id);
      return;
    }

    const { error } = await supabase.from('relationships').delete().eq('id', rel.id);

    // Reset
    setDeleteBondId(null);

    if (error) showToast("Error deleting bond: " + error.message, 'error');
    else {
      showToast("Bond dissolved");
      await refreshData();
    }
  };

  const getRelColor = (type) => {
    const colors = {
      lover: 'bg-red-500',
      friend: 'bg-blue-500',
      colleague: 'bg-yellow-500',
      acquaintance: 'bg-slate-500'
    };
    return colors[type] || 'bg-slate-500';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans overflow-auto relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-black pointer-events-none" />

      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent relative z-10 pt-12">
        Admin Control Center
      </h1>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-8 relative z-10">
        <button
          onClick={() => setActiveTab('people')}
          className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'people' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
          <UserPlus size={16} className="inline mr-2" />People
        </button>
        <button
          onClick={() => setActiveTab('bonds')}
          className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'bonds' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
          <Link2 size={16} className="inline mr-2" />Bonds
        </button>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        {activeTab === 'people' && (
          <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold text-blue-400 mb-6">
              <UserPlus size={20} className="inline mr-2" />Spawn Person
            </h2>

            <form onSubmit={handleAddPerson} className="flex flex-col gap-4">
              {/* Basic Info */}
              <div className="flex gap-3">
                <input className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Name *" value={newName} onChange={e => setNewName(e.target.value)} required />
                <input className="w-20 bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white text-center text-2xl" placeholder="😎" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} maxLength={2} title="Pick an emoji" />
              </div>
              <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Vibe Tag (e.g. The Architect, Chaos Energy)" value={newVibe} onChange={e => setNewVibe(e.target.value)} />

              {/* Bio */}
              <textarea className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white h-20 resize-none" placeholder="Bio - Who are they? What's their story?" value={newBio} onChange={e => setNewBio(e.target.value)} />

              {/* Details Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Cake size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="date" className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" value={newBirthday} onChange={e => setNewBirthday(e.target.value)} />
                </div>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Location" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                </div>
              </div>

              {/* Socials */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                  <input className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Instagram handle" value={newInstagram} onChange={e => setNewInstagram(e.target.value)} />
                </div>
                <div className="relative">
                  <Twitter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white" placeholder="Twitter/X handle" value={newTwitter} onChange={e => setNewTwitter(e.target.value)} />
                </div>
              </div>

              {/* Image */}
              <ImageDropzone value={newImg} onChange={setNewImg} previewName={newName} />

              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-lg transition shadow-lg shadow-blue-900/20 mt-2">Add to Universe</button>
            </form>


            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-widest">Population ({nodes.length})</h3>
              <div className="grid gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {[...nodes].sort((a, b) => a.name.localeCompare(b.name)).map(n => (
                  <div key={n.id} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl border border-white/5 hover:bg-white/10 transition group">
                    <div className="flex items-center gap-3">
                      {n.img && <img src={n.img} className="w-8 h-8 rounded-full" />}
                      <div>
                        <span className="text-sm text-white font-medium">{n.name}</span>
                        {n.vibe && <span className="text-xs text-gray-500 ml-2">{n.vibe}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => setEditingPerson(n)} className="p-2 hover:bg-white/10 rounded-lg transition" title="Edit">
                        <Pencil size={14} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(n)}
                        className={`p-2 rounded-lg transition flex items-center gap-1 ${deletePersonId === n.id ? 'bg-red-500 text-white opacity-100' : 'hover:bg-red-500/20 opacity-0 group-hover:opacity-100'}`}
                      >
                        <Trash2 size={14} className={deletePersonId === n.id ? 'text-white' : 'text-red-400'} />
                        {deletePersonId === n.id && <span className="text-xs font-bold">Sure?</span>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bonds' && (
          <div className="space-y-6">
            {/* Create Bond */}
            <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="text-xl font-bold mb-6 text-red-400">
                <Link2 size={20} className="inline mr-2" />Create Bond
              </h2>
              <form onSubmit={handleConnect} className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <select className="w-1/2 bg-black/40 border border-white/10 p-3 rounded-lg text-gray-300" value={sourceId} onChange={e => setSourceId(e.target.value)}>
                    <option value="">Person A</option>
                    {[...nodes].sort((a, b) => a.name.localeCompare(b.name)).map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                  <select className="w-1/2 bg-black/40 border border-white/10 p-3 rounded-lg text-gray-300" value={targetId} onChange={e => setTargetId(e.target.value)}>
                    <option value="">Person B</option>
                    {[...nodes].sort((a, b) => a.name.localeCompare(b.name)).map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <select className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-gray-300" value={relType} onChange={e => setRelType(e.target.value)}>
                  <option value="friend">Friend 🔵</option>
                  <option value="lover">Lover ❤️</option>
                </select>
                <textarea className="w-full bg-black/40 border border-white/10 p-3 rounded-lg h-24 text-white" placeholder="The Lore..." value={lore} onChange={e => setLore(e.target.value)} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Forging...
                    </>
                  ) : (
                    'Forge Link'
                  )}
                </button>
              </form>
            </div>

            {/* Existing Bonds */}
            <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
              <h3 className="font-bold text-xs text-gray-500 mb-4 uppercase tracking-widest">Existing Bonds ({links.length})</h3>
              <div className="grid gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {links.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bonds created yet</p>
                ) : (
                  [...links]
                    .sort((a, b) => {
                      const sA = nodes.find(n => n.id === (a.source.id || a.source))?.name || '';
                      const sB = nodes.find(n => n.id === (b.source.id || b.source))?.name || '';
                      return sA.localeCompare(sB);
                    })
                    .map(rel => {
                      const sourceId = rel.source?.id || rel.source;
                      const targetId = rel.target?.id || rel.target;

                      const source = nodes.find(n => n.id === sourceId);
                      const target = nodes.find(n => n.id === targetId);
                      return (
                        <div key={rel.id} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl border border-white/5 hover:bg-white/10 transition group">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${getRelColor(rel.type)}`}></span>
                            <span className="text-sm text-white">{source?.name || '?'}</span>
                            <span className="text-gray-500">↔</span>
                            <span className="text-sm text-white">{target?.name || '?'}</span>
                            <span className="text-xs text-gray-500 ml-2">{rel.type}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteRelationship(rel)}
                            className={`p-2 rounded-lg transition flex items-center gap-1 ${deleteBondId === rel.id ? 'bg-red-500 text-white opacity-100' : 'hover:bg-red-500/20 opacity-0 group-hover:opacity-100'}`}
                          >
                            <Trash2 size={14} className={deleteBondId === rel.id ? 'text-white' : 'text-red-400'} />
                            {deleteBondId === rel.id && <span className="text-xs font-bold">Sure?</span>}
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto mt-8 flex justify-center gap-4">
          <button
            onClick={async () => {
              if (!confirm('Fix legacy data? This turns "best_friend" into "friend".')) return;
              const { error } = await supabase.from('relationships').update({ type: 'friend' }).eq('type', 'best_friend');
              if (error) showToast(error.message, 'error');
              else { showToast("Data fixed! Legacy bonds updated."); refreshData(); }
            }}
            className="text-xs text-gray-600 hover:text-gray-400 underline"
          >
            Fix legacy data
          </button>
          <button
            onClick={async () => {
              if (!confirm('Remove duplicate bonds? This will keep one instance of each pair.')) return;

              // 1. Identify duplicates
              const uniquePairs = new Set();
              const duplicates = [];

              links.forEach(link => {
                const s = link.source.id || link.source;
                const t = link.target.id || link.target;
                // Store canonical pair key
                const key = s < t ? `${s}-${t}` : `${t}-${s}`;

                if (uniquePairs.has(key)) {
                  duplicates.push(link.id);
                } else {
                  uniquePairs.add(key);
                }
              });

              if (duplicates.length === 0) {
                showToast("No duplicates found.", 'success');
                return;
              }

              console.log("Removing duplicates:", duplicates);

              // 2. Delete duplicates
              const { error } = await supabase.from('relationships').delete().in('id', duplicates);

              if (error) showToast("Error removing duplicates: " + error.message, 'error');
              else {
                showToast(`Removed ${duplicates.length} duplicate bonds.`);
                refreshData();
              }
            }}
            className="text-xs text-gray-600 hover:text-gray-400 underline"
          >
            Clean Duplicates
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {
        editingPerson && (
          <EditModal
            person={editingPerson}
            onClose={() => setEditingPerson(null)}
            onSave={handleUpdatePerson}
          />
        )
      }

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div >
  );
};

export default AdminPanel;
