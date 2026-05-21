import RunpodDashboard from '@/components/RunpodDashboard';

export default function RunpodPage() {
    return (
        <main className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-7xl mx-auto">
                <RunpodDashboard />
            </div>
        </main>
    );
}
