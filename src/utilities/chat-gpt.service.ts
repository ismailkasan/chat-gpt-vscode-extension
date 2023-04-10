import { fetch } from 'undici';
import { TextDecoderStream } from 'node:stream/web';
import { Observable } from 'rxjs';

/**
 * Create asnyc request to ChatGpt api gets a response.
 * @param question is that want to ask to ChatGpt.
 * @param apikey of ChatGpt.
 * @returns 
 */
export async function askToChatGpt(query: string | undefined, apikey: string) {
    try {
        // 👇️ const response: Response
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: query }],
                temperature: 0.7
            }),
            headers: {
                "Content-Type": 'application/json',
                authorization: 'Bearer ' + apikey,
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        // 👇️ const result: CreateUserResponse
        const result: any = (await response.json());

        console.log('result is: ', JSON.stringify(result, null, 4));

        return result.choices[0].message.content;
    } catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        } else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}

/**
 * Create asnyc request to ChatGpt api and gets straem.
 * @param question is that want to ask to ChatGpt.
 * @param apikey of ChatGpt.
 * @returns 
 */
export function askToChatGptAsStream(query: string | undefined, apikey: string): Observable<string> {

    return new Observable<string>(observer => {
        // 👇️ const response: Response
        const response = fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: query }],
                temperature: 0.7,
                stream: true
            }),
            headers: {
                'Content-Type': 'application/json',
                authorization: 'Bearer ' + apikey,
            },
        });

        let content = '';
        response.then(async res => {
            const textStream = res.body?.pipeThrough(new TextDecoderStream());
            if (textStream) {
                for await (const chunk of textStream) {
                    // console.log(chunk);
                    const eventStr = chunk.split('\n\n');
                    for (let i = 0; i < eventStr.length; i++) {
                        const str = eventStr[i];
                        if (str === 'data: [DONE]') {
                            break;
                        }
                        if (str && str.slice(0, 6) === 'data: ') {
                            const jsonStr = str.slice(6);
                            const data: any = JSON.parse(jsonStr);
                            const thisContent = data.choices[0].delta?.content || '';
                            content += thisContent;
                            observer.next(thisContent);
                        }
                    }
                }
            }
        }).catch((err: Error) => {
            observer.error(err?.message);
        });
    });
}
