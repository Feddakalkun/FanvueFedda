import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

/**
 * Executes a Python command using the RunPod SDK.
 * Wraps the execution to return JSON parsed data using a temp file for Windows stability.
 */
async function runPythonSDK(apiKey: string, scriptContent: string) {
    const escapedKey = apiKey.replace(/'/g, "\\'");
    const tempScriptPath = join(tmpdir(), `runpod-${Date.now()}.py`);

    const fullScript = `
import runpod
import json
import os
runpod.api_key = '${escapedKey}'
${scriptContent}
  `.trim();

    try {
        await writeFile(tempScriptPath, fullScript);
        const { stdout, stderr } = await execAsync(`python "${tempScriptPath}"`);

        // Clean up temp file
        await unlink(tempScriptPath).catch(() => { });

        if (!stdout) {
            if (stderr) throw new Error(stderr);
            throw new Error("Python script returned empty output");
        }

        // Split output into lines and try to find the actual JSON response
        // We look for the last JSON-looking block since that's usually the intended output
        const lines = stdout.trim().split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if ((line.startsWith('{') && line.endsWith('}')) || (line.startsWith('[') && line.endsWith(']'))) {
                try {
                    // Normalize Python-style quotes if necessary (though json.dumps should be fine)
                    // and handle common non-JSON bits if they exist
                    const sanitized = line.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false').replace(/None/g, 'null');
                    return JSON.parse(sanitized);
                } catch (e) {
                    // Try parsing the original line if sanitization failed or wasn't needed
                    try {
                        return JSON.parse(line);
                    } catch (innerE) {
                        continue; // Try previous line
                    }
                }
            }
        }

        throw new Error(`Failed to parse response. Output was: ${stdout}`);
    } catch (error: any) {
        console.error('RunPod SDK Error:', error);
        // Cleanup if error occurred before unlink
        await unlink(tempScriptPath).catch(() => { });
        throw new Error(error.message || 'Failed to execute RunPod SDK command');
    }
}

export async function listGPUs(apiKey: string) {
    return runPythonSDK(apiKey, "print(json.dumps(runpod.get_gpus()))");
}

export async function getPods(apiKey: string) {
    return runPythonSDK(apiKey, "print(json.dumps(runpod.get_pods()))");
}

export async function getPodDetails(apiKey: string, podId: string) {
    const pyCmd = `
pods = runpod.get_pods()
pod = next((p for p in pods if p['id'] == '${podId}'), None)
print(json.dumps(pod))
  `;
    return runPythonSDK(apiKey, pyCmd);
}

export async function getEndpoints(apiKey: string) {
    return runPythonSDK(apiKey, "print(json.dumps(runpod.get_endpoints()))");
}

export async function createPod(apiKey: string, gpuId: string, imageOrTemplate?: string, networkVolumeId?: string) {
    // Default to comfyui if empty
    const target = imageOrTemplate || "ptudev/comfyui:latest";
    const isImage = target.includes('/') || target.includes(':');

    const pyCmd = `
pod = runpod.create_pod(
    name='vf-train-${Date.now()}', 
    ${isImage ? `image_name='${target}'` : `template_id='${target}'`}, 
    gpu_type_id='${gpuId}', 
    container_disk_in_gb=50, 
    volume_in_gb=50,
    ports="22/tcp,8888/tcp,8188/tcp"${networkVolumeId ? `, network_volume_id='${networkVolumeId}'` : ''}
)
print(json.dumps(pod))
  `;
    return runPythonSDK(apiKey, pyCmd);
}

export async function createTemplate(apiKey: string, name: string, image: string) {
    const pyCmd = `
tmpl = runpod.create_template(name="${name}", image_name="${image}", container_disk_in_gb=50)
print(json.dumps(tmpl))
  `;
    return runPythonSDK(apiKey, pyCmd);
}

export async function getBalance(apiKey: string) {
    const pyCmd = `
import requests
import json
url = 'https://api.runpod.io/graphql?api_key=${apiKey}'
query = 'query { myself { clientBalance } }'
try:
    resp = requests.post(url, json={'query': query})
    data = resp.json()
    if 'data' in data and 'myself' in data['data']:
        print(json.dumps({'credits': data['data']['myself']['clientBalance']}))
    else:
        print(json.dumps({'credits': 0.0}))
except:
    print(json.dumps({'credits': 0.0}))
  `;
    return runPythonSDK(apiKey, pyCmd);
}

export async function stopPod(apiKey: string, podId: string) {
    return runPythonSDK(apiKey, `print(json.dumps(runpod.stop_pod('${podId}')))`);
}

export async function startPod(apiKey: string, podId: string) {
    return runPythonSDK(apiKey, `print(json.dumps(runpod.start_pod('${podId}')))`);
}

export async function terminatePod(apiKey: string, podId: string) {
    return runPythonSDK(apiKey, `print(json.dumps(runpod.terminate_pod('${podId}')))`);
}

export async function getPodLogs(apiKey: string, podId: string) {
    // We use GraphQL via requests to get the most reliable log output
    const pyCmd = `
import requests
import json
url = 'https://api.runpod.io/graphql?api_key=${apiKey}'
query = 'query { podLog(podId: "${podId}") }'
try:
    resp = requests.post(url, json={'query': query})
    data = resp.json()
    if 'data' in data and 'podLog' in data['data']:
        print(json.dumps({'logs': data['data']['podLog']}))
    else:
        print(json.dumps({'logs': 'No logs available.'}))
except Exception as e:
    print(json.dumps({'logs': str(e)}))
  `;
    return runPythonSDK(apiKey, pyCmd);
}

export async function listVolumes(apiKey: string) {
    const pyCmd = `
import requests
import json
url = 'https://api.runpod.io/graphql?api_key=${apiKey}'
query = 'query { myself { networkVolumes { id name size dataCenterId } } }'
try:
    resp = requests.post(url, json={'query': query})
    data = resp.json()
    if 'data' in data and 'myself' in data['data']:
        print(json.dumps(data['data']['myself']['networkVolumes']))
    else:
        print(json.dumps([]))
except:
    print(json.dumps([]))
  `;
    return runPythonSDK(apiKey, pyCmd);
}

export async function createVolume(apiKey: string, name: string, size: number, dataCenterId: string) {
    // REST API is often easier for raw volume creation in some SDK versions, but let's stick to GraphQL if possible
    // Using requests for direct GraphQL mutation
    const pyCmd = `
import requests
import json
url = 'https://api.runpod.io/graphql?api_key=${apiKey}'
query = 'mutation { networkVolumeCreate(input: { name: "${name}", size: ${size}, dataCenterId: "${dataCenterId}" }) { id name size } }'
try:
    resp = requests.post(url, json={'query': query})
    data = resp.json()
    if 'data' in data and 'networkVolumeCreate' in data['data']:
        print(json.dumps(data['data']['networkVolumeCreate']))
    else:
        print(json.dumps({'error': data.get('errors', 'Unknown error')}))
except Exception as e:
    print(json.dumps({'error': str(e)}))
  `;
    return runPythonSDK(apiKey, pyCmd);
}

export async function deleteVolume(apiKey: string, volumeId: string) {
    const pyCmd = `
import requests
import json
url = 'https://api.runpod.io/graphql?api_key=${apiKey}'
query = 'mutation { networkVolumeDelete(input: { volumeId: "${volumeId}" }) }'
try:
    resp = requests.post(url, json={'query': query})
    data = resp.json()
    print(json.dumps({'success': 'data' in data}))
except:
    print(json.dumps({'success': false}))
  `;
    return runPythonSDK(apiKey, pyCmd);
}
