interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface ChatCompletionParams {
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    model: string;
}
export declare const glmService: {
    chatCompletion(params: ChatCompletionParams): Promise<any>;
    chatCompletionStream(params: ChatCompletionParams): Promise<any>;
};
export {};
//# sourceMappingURL=glm.d.ts.map