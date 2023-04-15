
# ChatGpt extension for VSCode

This is a chat bot that uses ChatGpt api. After setting your ChatGpt api key, you can use the chat bot and ask what you want. 
To learn more please visit offical [OpenAI](https://openai.com/).

Chat bot uses ChatGpt api with defaults below;

- model : "gpt-3.5-turbo"
- temperature : 0.7

In the future, we are planning to add settings panel. So, user is able to change settings.
## Appendix

This chat bot uses vscode api. Your API KEY will be safely stored in your workspace.
Add new three commands to VSCode editor context menu with their keyboard shortcuts.
These:
- ChatGpt Add Comments(ctrl+ alt + C, shift + cmd + c). Support all language.
- ChatGpt Add Documentaions(ctrl + alt + d, shift + cmd + d). Support javaScript, TypeScript, Java and C#.
- ChatGpt Refactor(ctrl + alt + r, shift + cmd + r). Support all language.

The result of these commands depent on ChatGpt "text-davinci-003" model. 

ChatGpt Models:
- [gpt-3.5-turbo](https://github.com/kydycode/chatgpt-3.5-turbo) used for chat.
- [text-davinci-003](https://platform.openai.com/docs/models/gpt-3-5) used for text complations.

## Installation

Your vscode has to be upper or equel 1.77.0 version.
Install from VSCode Extensions panel or [vscode-chat-gpt](https://marketplace.visualstudio.com/items?itemName=ikasann-self.vscode-chat-gpt) from VSCode Marketplace

```bash
  Go to Settings > Extensions > vscode-chat-gpt
```
## Release Notes

- v0.0.1 first relese with simple command and chat panel.
- v0.0.2 Add icon start button on VSCode Activity bar.
- V0.0.3 bugfix updates
- V1.0.0 Add Explorer View and show history of last 10 queries.
- V1.1.0 Add new three commands to VSCode editor context menu. These: ChatGpt Add Comments, ChatGpt Add Documentaions and ChatGpt Refactor.

## Roadmap

- Add ChatGpt Create image model.
- Add ChatGpt Edit image model.
- Add ChatGpt Create image variation model.

## 🚀 About Me
I'm a full stack developer. I've been dealing with software since 2016. I worked on a lot of projects so far. My strongest skills are C#, .Net
Core, MsSql, javaScript, TypeScript and Angular2+. Also, I am working on sample like this extension Nodejs, MongoDb projects.
## Using Extension

* Open chat panel.

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/start-and-api-key.gif?raw=true)

* Set api key.

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/extension.png?raw=true)

## For more information

* Say hello!

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/extension-1.png?raw=true)

* Wite a simple typescript code that find squareroot of a number.

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/extension-2.png?raw=true)

* Click recent query in the history.

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/history-clear.gif?raw=true)

* Add comments.

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/add-comment-1.png?raw=true)

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/add-comment-2.png?raw=true)

* Add documentations.

![alt text](https://github.com/ismailkasan/chat-gpt-vscode-extension/blob/main/src/images/add-documentation-1.png?raw=true)