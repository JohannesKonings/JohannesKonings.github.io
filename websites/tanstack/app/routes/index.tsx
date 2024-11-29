// app/routes/index.tsx
import * as React from "react";
import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import {
	ThemeProvider,
	createTheme,
	CssBaseline,
	Container,
	Typography,
	Link,
} from "@mui/material";
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

const darkTheme = createTheme({
	palette: {
		mode: "dark",
	},
});

function Home() {
	// const router = useRouter();
	// const state = Route.useLoaderData();
	// const isDev = process.env.NODE_ENV === "development";
	// console.log("isDev", isDev);
	// console.log("process.env.NODE_ENV", process.env.NODE_ENV);

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container style={{ textAlign: "center" }}>
				{/* <img src="/tanstack/img/avatar.png" alt="Avatar" /> */}
				<img src={avatar} alt="Avatar" />
				<div>
					<Link
						href="https://github.com/johanneskonings"
						target="_blank"
						rel="noopener noreferrer"
						color="inherit"
						style={{ margin: "0 10px" }}
					>
						<MdiGithub style={{ fontSize: "48px" }} />
					</Link>
					<Link
						href="https://bsky.app/profile/johanneskonings.dev"
						target="_blank"
						rel="noopener noreferrer"
						color="inherit"
						style={{ margin: "0 10px" }}
					>
						<Fa6BrandsBluesky style={{ fontSize: "48px" }} />
					</Link>
				</div>
				<Typography variant="h3" style={{ fontFamily: "Cascadia Code" }}>
					Johannes Konings
				</Typography>
			</Container>
		</ThemeProvider>
	);
}
