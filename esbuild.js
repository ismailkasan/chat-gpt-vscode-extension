// file: esbuild.js

const { build } = require("esbuild");

const baseConfig = {
    bundle: true,
    minify: process.env.NODE_ENV === "production",
    sourcemap: process.env.NODE_ENV !== "production",
};

const extensionConfig = {
    ...baseConfig,
    platform: "node",
    mainFields: ["module", "main"],
    format: "cjs",
    entryPoints: ["./src/extension.ts"],
    outfile: "./out/extension.js",
    external: ["vscode"],
};

const watchConfig = {
    watch: {
        onRebuild(error, result) {
            console.log("[watch] build started");
            if (error) {
                error.errors.forEach(error =>
                    console.error(`> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`)
                );
            } else {
                console.log("[watch] build finished");
            }
        },
    },
};


const webviewConfig = {
    ...baseConfig,
    target: "es2020",
    format: "esm",
    entryPoints: ["./src/webview/main.ts"],
    outfile: "./out/webview.js",
};

const cssConfig = {
    ...baseConfig,
    entryPoints: ["./src/style.css"],
    outfile: "./out/style.css",
};
const imgConfig = {
    ...baseConfig,
    loader: {
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
        ".svg": "file",
        ".gif": "file",
      },
    //   assetNames: "[dir]/[name]",
    //  entryPoints: ["./src/images/chat-gpt-logo-2.jpeg"],
    
      outfile: "./out",
};

(async () => {
    const args = process.argv.slice(2);
    try {
        if (args.includes("--watch")) {
            // Build and watch source code
            console.log("[watch] build started");
            await build({
                ...extensionConfig,
                ...watchConfig,
            });
            await build({
                ...webviewConfig,
                ...watchConfig,
            });
            await build({
                ...cssConfig,
                ...watchConfig,
            });
            await build({
                ...imgConfig,
                ...watchConfig,
            });
            console.log("[watch] build finished");
        } else {
            await build(extensionConfig);
            await build(webviewConfig);
            await build(cssConfig);
            await build(imgConfig);
            console.log("build complete");
        }

    } catch (err) {
        process.stderr.write(err.stderr);
        process.exit(1);
    }
})();