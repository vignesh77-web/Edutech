import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { addVideoNote, getVideoNotes, deleteVideoNote } from '../../../services/operations/videoNoteAPI';
import IconBtn from '../../common/IconBtn';
import { FiClock, FiTrash2 } from 'react-icons/fi';

const VideoNotes = ({ courseId, subSectionId, playerRef }) => {
    const { token } = useSelector((state) => state.auth);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            if (subSectionId) {
                const result = await getVideoNotes(subSectionId, token);
                if (result) {
                    setNotes(result);
                }
            }
        };
        fetchNotes();
    }, [subSectionId, token]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        
        let currentTime = 0;
        if (playerRef?.current) {
            currentTime = playerRef.current.getState().player.currentTime;
        }

        setLoading(true);
        const result = await addVideoNote({
            courseId,
            subSectionId,
            note: newNote,
            timestamp: currentTime,
        }, token);

        if (result) {
            setNotes([...notes, result].sort((a,b) => a.timestamp - b.timestamp));
            setNewNote("");
        }
        setLoading(false);
    };

    const handleDeleteNote = async (noteId) => {
        setLoading(true);
        const success = await deleteVideoNote(noteId, token);
        if (success) {
            setNotes(notes.filter(n => n._id !== noteId));
        }
        setLoading(false);
    };

    const handleSeek = (time) => {
        if (playerRef?.current) {
            playerRef.current.seek(time);
            playerRef.current.play(); // Auto-play if paused
        }
    };

    const formatTimestamp = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="mt-8 border-t border-richblack-700 pt-6">
            <h2 className="text-2xl font-semibold text-richblack-5 mb-6">My Bookmarks & Notes</h2>
            
            {/* Add Note Form */}
            <div className="flex flex-col gap-3 mb-8 bg-richblack-800 p-4 rounded-md border border-richblack-700">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type a note here. It will automatically bookmark your current timestamp..."
                    className="form-style w-full min-h-[80px] text-sm"
                />
                <IconBtn
                    text="Save Bookmark"
                    onclick={handleAddNote}
                    disabled={loading || !newNote.trim()}
                    customClasses="self-end"
                />
            </div>

            {/* Notes List */}
            <div className="flex flex-col gap-4">
                {notes.length === 0 ? (
                    <p className="text-richblack-300 text-center py-4">You have no notes for this lecture.</p>
                ) : (
                    notes.map((note) => (
                        <div key={note._id} className="flex flex-col gap-2 bg-richblack-800 p-4 rounded-md border border-richblack-700 group">
                            <div className="flex items-center justify-between">
                                <button 
                                    onClick={() => handleSeek(note.timestamp)}
                                    className="flex items-center gap-2 text-yellow-50 hover:text-yellow-100 font-semibold text-sm bg-yellow-900/30 px-3 py-1 rounded-full transition-all"
                                >
                                    <FiClock /> {formatTimestamp(note.timestamp)}
                                </button>
                                <button 
                                    onClick={() => handleDeleteNote(note._id)}
                                    className="text-richblack-400 hover:text-pink-200 transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Note"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                            <p className="text-richblack-100 mt-2 whitespace-pre-wrap">{note.note}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VideoNotes;
