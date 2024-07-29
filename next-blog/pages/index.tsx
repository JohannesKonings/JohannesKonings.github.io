import fs from "node:fs";
import matter from "gray-matter";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Personal from "../components/personal";
import React from "react";

export async function getStaticProps() {
	// const files = fs.readdirSync('posts');
	const files = fs.readdirSync("../_posts");

	const posts = files.map((fileName) => {
		const slug = fileName.replace(".md", "");
		const readFile = fs.readFileSync(`../_posts/${fileName}`, "utf-8");
		const { data: frontmatter } = matter(readFile);
		const date = frontmatter.date;

		// if cover image not starting with https copy to folder cover-images
		if (
			frontmatter.cover_image &&
			!frontmatter.cover_image.startsWith("https")
		) {
			console.log(JSON.stringify(frontmatter, null, 2));
			console.log(`copying cover image ${frontmatter.cover_image}`);
			console.log("fileName", fileName);
			const coverImage = fs.readFileSync(`../${frontmatter.cover_image}`);
			fs.writeFileSync(`out/images/cover-images/${slug}.png`, coverImage);
			frontmatter.cover_image_out = `images/cover-images/${slug}.png`;
		} else if (frontmatter.cover_image) {
			frontmatter.cover_image_out = frontmatter.cover_image;
		}

		return {
			slug,
			frontmatter,
			date,
		};
	});
	posts.sort((a, b) => {
		return (
			new Date(b.frontmatter.date).getTime() -
			new Date(a.frontmatter.date).getTime()
		);
	});
	// convert date to local date without time -> format dd.mm.yyyy
	posts.forEach((post) => {
		post.date = new Date(post.date).toLocaleDateString("de-DE", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	});

	return {
		props: {
			posts,
		},
	};
}

export default function Home({ posts }: { posts: any }) {
	const { basePath } = useRouter();

	return (
		<>
			<Personal />

			<div
				key="home-div"
				className="flex flex-col items-center justify-center p-0 m-0"
			>
				{posts.map(
					({
						slug,
						frontmatter,
						date,
					}: {
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						slug: any;
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						frontmatter: any;
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						date: any;
					}) => (
						<React.Fragment key={slug}>
							<div className="card w-96 glass">
								<Link href={`/post/${slug}`} className="m-0 p-0">
									<figure>
										<Image
											width={700}
											height={390}
											src={frontmatter.cover_image_out}
											alt="car!"
										/>
									</figure>
									<div className="card-body">
										<h2 className="card-title">{frontmatter.title}</h2>
										<p>{date}</p>
										{/* <div className="card-actions justify-end">
                    <button className="btn btn-primary">Learn now!</button>
                  </div> */}
									</div>
								</Link>
							</div>
							{/* <div className='flex flex-col max-w-2xl border-4 border-gray-200 m-2 rounded-xl shadow-4xl w-full mr-0 pr-0'>
              <Link href={`/post/${slug}`} className="m-0 p-0">
                <div className='flex flex-row justify-between p-4 rounded-t-xl'>
                  <Image
                    className="w-full m-0 p-0"
                    width={700}
                    height={390}
                    alt={frontmatter.title}
                    src={frontmatter.cover_image_out}
                    // src={frontmatter.cover_image.startsWith('https') ? frontmatter.cover_image : `${basePath}/${frontmatter.cover_image}`}
                  />
                </div>
                <div className='flex flex-col bg-gray-300 justify-between p-2 pb-4 rounded-t-xl rounded-b-xl w-4/5 mx-auto'>
                  <p className='text-center text-black'>{date}</p>
                  <h1 className='text-center text-black'>{frontmatter.title}</h1>
                </div>
              </Link>
            </div> */}
						</React.Fragment>
					),
				)}
			</div>
		</>
	);
}
