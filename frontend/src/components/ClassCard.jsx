export default function ClassCard({ title, time, instructor, status, link }) {
    const statusColors = {
        upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        live: 'bg-green-500/20 text-green-400 border-green-500/30',
        completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
        <div className="glass glass-hover rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{instructor}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>

            <div className="flex items-center text-sm text-[var(--text-secondary)] mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {time}
            </div>

            {link && (
                <button className="w-full gradient-primary text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-all">
                    Join Class
                </button>
            )}
        </div>
    );
}
