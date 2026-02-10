import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav />
            <main className="pb-20 md:pb-0">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
