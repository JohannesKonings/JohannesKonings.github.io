import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";

export default function Personal() {
	const { basePath } = useRouter();

	const [animationClass, setAnimationClass] = useState("animate-pulse");

	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimationClass("");
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<div
				key="personal"
				className={`relative flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 min-h-[350px] ${animationClass}`}
			>
				<Image
					className="absolute top-[-20%]"
					src={`${basePath}/images/avartar.png`}
					alt="Avatar"
					width={150}
					height={150}
				/>
				<h1 className="mt-[-50px] text-black text-5xl">Johannes Konings</h1>
				<div className="flex space-x-4 mt-2">
					<a
						href="https://github.com/JohannesKonings"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FontAwesomeIcon
							icon={faGithub}
							className="text-black hover:text-gray-700 text-3xl"
						/>
					</a>
					<a
						href="https://linkedin.com/in/JohannesKonings"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FontAwesomeIcon
							icon={faLinkedin}
							className="text-black hover:text-gray-700 text-3xl"
						/>
					</a>
				</div>
			</div>
		</>
	);
}
