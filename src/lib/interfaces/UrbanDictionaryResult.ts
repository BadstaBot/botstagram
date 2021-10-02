export interface UrbanDictionaryResultArray {
    list: UrbanDictionaryResult[]
}

export interface UrbanDictionaryResult {
    definition: string;
    permalink: string;
    sound_urls: unknown[]
    author: string;
    word: string;
    defid: number;
    current_vote: string;
    written_on: Date;
    example: string;
    thumbs_down: number;
}
