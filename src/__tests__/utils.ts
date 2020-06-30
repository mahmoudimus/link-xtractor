import {extension_id} from "../utils";

test('extension_id calculates chrome extension id from path', () => {
    expect(extension_id('/crx')).toBe('daakhilhochfmiilgaiaimfbfiednnla');
})
