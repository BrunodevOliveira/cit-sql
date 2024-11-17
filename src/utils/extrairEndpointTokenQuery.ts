export default function extrairEndpointTokenQuery(text: string): { endpoint?: string; token?: string; query: string } {
    const endpointMatch = text.match(/--endpoint:\s*(https?:\/\/[^\s]+)/);
    const tokenMatch = text.match(/--token:\s*([^\s]+)/);

    const endpoint = endpointMatch ? endpointMatch[1] : undefined;
    const token = tokenMatch ? tokenMatch[1] : undefined;
    
    let query = text;
    if (endpointMatch) {
        query = query.replace(endpointMatch[0], '');
    }
    if (tokenMatch) {
        query = query.replace(tokenMatch[0], '');
    }
    query = query.trim();

    return { endpoint, token, query };
}