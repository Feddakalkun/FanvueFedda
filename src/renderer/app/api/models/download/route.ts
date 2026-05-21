import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

let currentProcess: any = null;
const LOG_FILE = path.join(process.cwd(), 'model_download.log');

export async function POST(request: Request) {
    const { packageId } = await request.json();

    if (currentProcess) {
        return NextResponse.json({ error: 'A download is already in progress' }, { status: 400 });
    }

    // Clear log
    fs.writeFileSync(LOG_FILE, `--- Starting Download for Package ${packageId} ---\n`);

    const psScript = path.join(process.cwd(), 'scripts', 'download_models.ps1');

    // Run PowerShell script in background
    currentProcess = spawn('powershell.exe', [
        '-ExecutionPolicy', 'Bypass',
        '-File', psScript,
        '-PackageId', packageId
    ], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'pipe'
    });

    currentProcess.stdout.on('data', (data: any) => {
        fs.appendFileSync(LOG_FILE, data.toString());
    });

    currentProcess.stderr.on('data', (data: any) => {
        fs.appendFileSync(LOG_FILE, `ERROR: ${data.toString()}`);
    });

    currentProcess.on('close', (code: any) => {
        fs.appendFileSync(LOG_FILE, `--- Process exited with code ${code} ---\n`);
        currentProcess = null;
    });

    return NextResponse.json({ success: true, message: 'Download started' });
}

export async function GET() {
    // Return the current log content
    if (!fs.existsSync(LOG_FILE)) return NextResponse.json({ log: '' });
    const log = fs.readFileSync(LOG_FILE, 'utf8');
    return NextResponse.json({
        log,
        isDownloading: !!currentProcess
    });
}
