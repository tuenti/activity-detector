module.exports = {
    output: {
        library: 'activityDetector',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: /\.js$/, exclude: /node_modules/,
                loader: 'babel',
                query: {
                    plugins: ['add-module-exports']
                }
            }
        ]
    }
};
