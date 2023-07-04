/** @type {import('next').NextConfig} */
const nextConfig = {
    // compress: true,
    webpack: (config) => {
        config.module.rules.push(
            {
                test: /\.svg/,
                use: [
                    {
                        loader: "react-svg-loader"
                    }
                ]
            }
        )
        return config;
    }
}

module.exports = nextConfig
