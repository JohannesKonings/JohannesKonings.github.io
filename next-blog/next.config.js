/** @type {import('next').NextConfig} */
const basePath = "/next-blog/out";
const nextConfig = {
	basePath: basePath,
	output: "export",
	reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: true,
	},
};

module.exports = nextConfig;
