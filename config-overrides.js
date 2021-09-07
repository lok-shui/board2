const {override, overrideDevServer, addDecoratorsLegacy, addWebpackAlias, adjustWorkbox, useEslintRc, enableEslintTypescript, useBabelRc, disableChunk} = require('customize-cra');
const path = require('path');
const proxy = require('./config.proxy');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
    webpack: override(
        useEslintRc(),
        addWebpackAlias({
            '@': path.resolve(__dirname, 'src')
        }),
        useBabelRc(),
        addDecoratorsLegacy(),
        adjustWorkbox(wb => Object.assign(wb, {importWorkboxFrom: 'local'})),
        // disableChunk(),
        config => {
          // config.plugins.push(new BundleAnalyzerPlugin())
          config.optimization.minimize = false
          return config
        }
    ),
    devServer: overrideDevServer(config => ({...config, proxy})),
    paths: paths => {
        paths.appBuild = path.resolve(__dirname, 'dist');
        return paths;
    }
};
