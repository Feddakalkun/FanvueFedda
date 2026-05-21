import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const workflowsDir = path.join(process.cwd(), 'config', 'workflows');
        if (!fs.existsSync(workflowsDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(workflowsDir);
        const workflows = files
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                id: file.replace('.json', ''),
                name: file.replace('.json', '').replace(/_/g, ' ').toUpperCase(),
                path: file
            }));

        return NextResponse.json(workflows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to list workflows' }, { status: 500 });
    }
}
