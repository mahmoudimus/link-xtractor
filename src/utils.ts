import * as crypto from 'crypto';

type ExtensionPath =
    | crypto.BinaryLike
    | string;


function ord(input: string): number{
    return input.charCodeAt(0);
}

function chr(input: number): string {
    return String.fromCharCode(input);
}


export function extension_id(path: ExtensionPath) : string {
    const hash = crypto.createHash('sha256');
    let algo = new Array<string>();
    let digest: string = hash.update(path).digest('hex');
    for (let i = 0; i < 32; i++) {
        let b = parseInt(digest.charAt(i), 16) + ord('a');
        algo.push(chr(b));
    }
    return algo.join('');
}

// const input = fs.createReadStream(filename);
// input.on('readable', () => {
//     const data = input.read();
//     if (data)
//         hash.update(data);
//     else {
//         console.log(`${hash.digest('hex')} ${filename}`);
//     }
// });
