// app/routes/index.tsx
import * as React from "react";
import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

// import { Icon } from "@iconify/react";
// import {
// 	faTwitter,
// 	faGithub,
// 	faBluesky,
// } from "@fortawesome/free-brands-svg-icons";
import avatar from "../images/avatar.png";
import { Fa6BrandsBluesky, MdiGithub } from "../icons";

// import "@fortawesome/fontawesome-svg-core/styles.css";

// import { config } from "@fortawesome/fontawesome-svg-core";
// config.autoAddCss = false; /* eslint-disable import/first */

export const Route = createFileRoute("/")({
	// component: React.lazy(() =>
	// 	import("./index").then((module) => ({ default: module.Home })),
	// ),
	component: Home,
	// loader: async () => await getCount(),
	notFoundComponent: () => <div>Page Not Found</div>,
});
// const rootRoute = createRootRoute({
// });
// export const Route = createRoute({
// 	path: "/tanstack",
// 	component: Home,
// 	getParentRoute: () => rootRoute,
// });

function Home() {
	return (
		<>
			<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-gray-500 via-gray-400 to-gray-300 animate-fade">
				<img src={avatar} alt="Avatar" className="mb-5" />
				<div className="flex items-center justify-center mb-5">
					<a
						href="https://github.com/johanneskonings"
						target="_blank"
						rel="noopener noreferrer"
						className="mx-5 transition-transform duration-300 ease-in-out hover:scale-110"
					>
						<MdiGithub className="text-6xl" />
					</a>
					<a
						href="https://bsky.app/profile/johanneskonings.dev"
						target="_blank"
						rel="noopener noreferrer"
						className="mx-5 transition-transform duration-300 ease-in-out hover:scale-110"
					>
						<Fa6BrandsBluesky className="text-6xl" />
					</a>
				</div>
				<h3>Johannes Konings</h3>
			</div>
		</>
	);
}
