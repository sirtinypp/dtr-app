import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav />
            <main className="pb-20 md:pb-0">
                {children}
                <div className="text-center py-6 pb-24 md:pb-6">
                    <p className="text-[10px] text-gray-400 font-mono opacity-50">created by acbasa</p>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
