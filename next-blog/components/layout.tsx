import Link from "next/link";
import { useRouter } from "next/router";

import React, { ReactNode, useState } from "react";
import Search from "./search";

interface LayoutProps {
	children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const { basePath } = useRouter();

	return (
		<>
			<div key="layout" className="flex flex-col min-h-screen">
				<header className="bg-fuchsia-100 mb-8 py-4">
					<div className="container mx-auto flex justify-center">
						<Link href="/">🏡</Link>
						<span className="mx-auto" />
						<button onClick={() => setIsSearchOpen(true)}>🔎</button>
						<Search
							isOpen={isSearchOpen}
							onClose={() => setIsSearchOpen(false)}
						/>
					</div>
				</header>
				<main className="container mx-auto flex-1">
					<div>{children}</div>
				</main>
				<footer className="bg-fuchsia-100 mt-8 py-4">
					<div className="container mx-auto flex justify-center">
						<a href={`${basePath}/impressum`}>Impressum</a>
					</div>
					<div className="container mx-auto flex justify-center">
						&lt;/&gt; on{" "}
						<a href="https://github.com/JohannesKonings/JohannesKonings.github.io">
							Github
						</a>{" "}
						&nbsp;<i className="fa fa-github-alt"></i>
					</div>
				</footer>
			</div>
		</>
	);
}
