// file: esbuild.js

const { build } = require("esbuild");
const copyStaticFiles = require('esbuild-copy-static-files')

const baseConfig = {
    bundle: true,
    minify: process.env.NODE_ENV === "production",
    sourcemap: process.env.NODE_ENV !== "production",
    plugins: [copyStaticFiles({
        src: './src/media',
        dest: './out/media',
        dereference: true,
        errorOnExist: false,
        // filter: EXPLAINED_IN_MORE_DETAIL_BELOW,
        preserveTimestamps: true,
        recursive: true,
      })],
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

const webViewConfig = {
    ...baseConfig,
    target: "es2020",
    format: "esm",
    entryPoints: ["./src/webviews/main-view.ts"],
    outfile: "./out/mainview.js",
};

const imageViewConfig = {
    ...baseConfig,
    target: "es2020",
    format: "esm",
    entryPoints: ["./src/webviews/image-view.ts"],
    outfile: "./out/imageview.js",
};

const sideBarViewConfig = {
    ...baseConfig,
    target: "es2020",
    format: "esm",
    entryPoints: ["./src/webviews/side-bar-view.ts"],
    outfile: "./out/side-bar-view.js",
};

const testConfig = {
    ...baseConfig,
    // target: "es2020",
    // format: "esm",
    platform: 'node',
    entryPoints: ["./src/test/runTest.ts"],
    outfile: "./out/test/runTest.js",
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
                ...webViewConfig,
                ...watchConfig,
            });          
            await build({
                ...imageViewConfig,
                ...watchConfig,
            });          
            await build({
                ...sideBarViewConfig,
                ...watchConfig,
            });          
            await build({
                ...testConfig,
                ...watchConfig,
            });
            console.log("[watch] build finished");
        } else {
            await build(extensionConfig);
            await build(webViewConfig);
            await build(imageViewConfig);
            await build(sideBarViewConfig);
            await build(testConfig);
            console.log("build complete");
        }

    } catch (err) {
        process.stderr.write(err.stderr);
        process.exit(1);
    }
})();