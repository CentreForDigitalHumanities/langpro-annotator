const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const appVersion = process.env.APP_VERSION;
const gitCommit = process.env.GIT_COMMIT;
const sourceUrl = process.env.SOURCE_URL;
const { exec } = require('child_process');

console.log(colors.cyan('\nRunning pre-build tasks'));

async function getHash() {
    // Use environment variable if provided (Docker build)
    if (gitCommit) {
        return Promise.resolve(gitCommit);
    }

    // Otherwise use git (local development)
    return new Promise((resolve, reject) => {
        exec('git rev-parse HEAD', (error, stdout, stderr) => {
            if (error) {
                reject(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }

            resolve(stdout.trim());
        });
    });
}

async function getRemoteUrl() {
    // Use environment variable if provided (Docker build)
    if (sourceUrl) {
        return Promise.resolve(sourceUrl);
    }

    // Otherwise use git (local development)
    return new Promise((resolve, reject) => {
        exec('git config --get remote.origin.url', (error, stdout, stderr) => {
            if (error) {
                reject(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }

            // format is either:
            // git@github.com:CentreForDigitalHumanities/langpro-annotator.git
            // or https://github.com/CentreForDigitalHumanities/langpro-annotator.git
            // or https://USERNAME:SECRET@github.com/CentreForDigitalHumanities/langpro-annotator.git/

            // remove https://
            let sourceUrl = stdout.replace(/^https?:\/\//, '').trim();
            // remove git@ or USERNAME:SECRET@
            sourceUrl = sourceUrl.replace(/^[^@]+@/, '').trim();
            // replace : with /
            sourceUrl = sourceUrl.replace(':', '/');
            // remove .git/
            sourceUrl = sourceUrl.replace(/\.git\/?\n?$/, '');
            resolve('https://' + sourceUrl);
        });
    });
}

Promise.all([
    getHash().catch(() => 'unknown'),
    getRemoteUrl().catch(() => 'unknown')
]).then(([hash, remoteUrl]) => {
    if (hash === 'unknown' || remoteUrl === 'unknown') {
        console.log(colors.yellow('Git repository not found, using fallback values'));
        writeVersion(sourceUrl || 'unknown');
        return;
    }
    const sourceUrlWithHash = `${remoteUrl}/tree/${hash}`;
    writeVersion(sourceUrlWithHash);
}).catch((error) => {
    console.log(`${colors.red('Could not update version: ')} ${error}`);
    // Write version with fallback values anyway
    writeVersion(sourceUrl || 'unknown');
});

function writeVersion(sourceUrl) {
    const versionFilePath = path.join(__dirname + '/../src/environments/version.ts');
    const src = `export const version = '${appVersion}';
export const buildTime = '${new Date()}';
export const sourceUrl = '${sourceUrl}';
`;

    // ensure version module pulls value from package.json
    fs.writeFile(versionFilePath, src, { flat: 'w' }, function (err) {
        if (err) {
            return console.log(colors.red(err));
        }

        console.log(colors.green(`Updating application version ${colors.yellow(appVersion)}`));
        console.log(`${colors.green('Writing version module to ')}${colors.yellow(versionFilePath)}\n`);
        console.log(src);
    });
}
