type UploaderOptions = {
    url: string;
    method: string;
    data: Record<string, any>;
    headers: Record<string, string>;
    signal: AbortSignal;
    onProgress: (loaded: number, total: number) => void;
};
export default function uploader<T = unknown>(options: UploaderOptions): Promise<T>;
export {};
